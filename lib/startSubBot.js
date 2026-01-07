require("../settings");
require("../lib/database");

const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  jidDecode,
  DisconnectReason,
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");
const { Boom } = require("@hapi/boom");

const { smsg } = require("./message"); // ✅ igual que index.js
const { setState } = require("./subbotRegistry");

if (!global.subBots) global.subBots = new Map();

const SUBBOTS_DIR = path.join(__dirname, "../sessions/subbots");
const RECONNECT_DELAY = 3000;

let databaseLoaded = false;

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const log = {
  info: (m) => console.log(chalk.cyan("[INFO]"), m),
  ok: (m) => console.log(chalk.green("[OK]"), m),
  warn: (m) => console.log(chalk.yellow("[WARN]"), m),
  err: (m) => console.log(chalk.red("[ERROR]"), m),
};

const safeMkdir = (d) => !fs.existsSync(d) && fs.mkdirSync(d, { recursive: true });
const clearSession = (d) => {
  try { fs.rmSync(d, { recursive: true, force: true }); } catch {}
};

function cleanJidToNumber(jid = "") {
  return String(jid).split("@")[0].split(":")[0];
}

async function startSubBot(phone, mainHandler, parentClient, parentMsg, attempt = 0) {
  if (typeof mainHandler !== "function") throw new Error("mainHandler inválido");
  if (!phone || !/^[0-9]{7,15}$/.test(String(phone))) {
    throw new Error("Número inválido. Ej: 519xxxxxxxx (solo dígitos)");
  }

  if (!databaseLoaded) {
    try {
      await global.loadDatabase();
      databaseLoaded = true;
      log.ok("Base de datos cargada (SubBot)");
    } catch (e) {
      log.err("No se pudo cargar la base de datos (SubBot)");
    }
  }

  safeMkdir(SUBBOTS_DIR);
  const sessionPath = path.join(SUBBOTS_DIR, `subbot-${phone}`);
  safeMkdir(sessionPath);

  setState(phone, { status: "starting" });

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  // ✅ CLON de tu index.js principal
  const client = makeWASocket({
    version,
    auth: state,
    browser: ["Ubuntu", "Chrome"],
    logger: pino({ level: "fatal" }),
    printQRInTerminal: false, // ✅ SOLO CÓDIGO
    syncFullHistory: false,
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: false,
  });

  // ✅ Igual que el principal
  client.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      const d = jidDecode(jid) || {};
      return d.user && d.server ? `${d.user}@${d.server}` : jid;
    }
    return jid;
  };

  // ✅ evita ENOENT: asegura carpeta antes de escribir creds
  client.ev.on("creds.update", async () => {
    safeMkdir(sessionPath);
    await saveCreds();
  });

  const sendText = async (text) => {
    try {
      if (parentMsg?.reply) return await parentMsg.reply(text);
      if (parentClient?.sendMessage) return await parentClient.sendMessage(parentClient.user.id, { text });
    } catch {}
  };

  // ✅ SOLO PAIRING CODE (igual que principal, pero con reintentos)
  (async () => {
    if (state.creds.registered) return;

    await delay(1500);

    for (let i = 1; i <= 6; i++) {
      try {
        const code = await client.requestPairingCode(String(phone));
        log.ok(`[SubBot ${phone}] Código de vinculación: ${code}`);

        await sendText(
          `🔗 *Código de vinculación SubBot*\n` +
            `Número: *${phone}*\n` +
            `Código: *${code}*\n\n` +
            `WhatsApp (en el teléfono de ese número):\n` +
            `Dispositivos vinculados → Vincular un dispositivo → *Vincular con código*`
        );
        return;
      } catch (e) {
        await delay(900 + i * 300);
      }
    }

    await sendText(`⚠️ No pude generar el código para *${phone}*. Reintenta: *.subbot ${phone}*`);
  })().catch(() => {});

  // ✅ CONEXIÓN: sin process.exit(), con backoff/reintentos
  client.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "open") {
      setState(phone, { status: "open", lastError: null });
      log.ok(`[SubBot ${phone}] Bot conectado correctamente ✅`);
      await sendText(`✅ SubBot *${phone}* conectado. Ya funciona como el bot principal.`);
      return;
    }

    if (connection === "close") {
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const err = lastDisconnect?.error;

      const prev = global.subBotState?.get(phone);
      setState(phone, {
        status: "closed",
        reconnects: (prev?.reconnects || 0) + 1,
        lastError: err ? String(err) : null,
      });

      // no spamear stack en 515
      if (code !== 515 && code !== DisconnectReason.restartRequired) {
        log.warn(`[SubBot ${phone}] Desconectado (${code})`);
        log.err(err);
      } else {
        log.warn(`[SubBot ${phone}] WhatsApp pidió reinicio (515).`);
      }

      // ✅ Sesión inválida -> limpiar y parar
      if (
        code === DisconnectReason.loggedOut ||
        code === DisconnectReason.forbidden ||
        code === DisconnectReason.badSession ||
        code === 401
      ) {
        clearSession(sessionPath);
        setState(phone, { status: "error" });
        await sendText(`🧹 SubBot *${phone}* deslogueado. Sesión limpiada. Ejecuta: *.subbot ${phone}*`);
        try { global.subBots?.delete?.(phone); } catch {}
        try { client.end?.(); } catch {}
        return;
      }

      // backoff progresivo (máx 10s)
      const backoff = Math.min(RECONNECT_DELAY + attempt * 1500, 10000);
      await delay(backoff);

      // ✅ restartRequired (515) -> reconectar
      if (code === DisconnectReason.restartRequired || code === 515) {
        try { client.end?.(); } catch {}
        return startSubBot(phone, mainHandler, parentClient, parentMsg, attempt + 1);
      }

      // ✅ cierres comunes -> 2 reintentos
      if ((code === DisconnectReason.connectionClosed || code === 428) && attempt < 2) {
        try { client.end?.(); } catch {}
        return startSubBot(phone, mainHandler, parentClient, parentMsg, attempt + 1);
      }

      // sin más reintentos
      setState(phone, { status: "closed" });
      await sendText(`⚠️ SubBot *${phone}* se cerró (code=${code}). Ejecuta: *.subbot ${phone}*`);
      try { global.subBots?.delete?.(phone); } catch {}
      try { client.end?.(); } catch {}
    }
  });

  // ✅ MENSAJES: CLON del principal
  client.ev.on("messages.upsert", async ({ messages }) => {
    try {
      const mm = messages?.[0];
      if (!mm?.message) return;
      if (mm.key.remoteJid === "status@broadcast") return;

      const msg = smsg(client, mm);
      await mainHandler(client, msg);
    } catch (e) {
      log.err(e);
    }
  });

  return client;
}

module.exports = { startSubBot };
