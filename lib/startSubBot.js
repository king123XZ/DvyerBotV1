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

const { smsg } = require("./message"); // ✅ mismo que index.js (porque este archivo está dentro de /lib)

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

async function startSubBot(phone, mainHandler, parentClient, parentMsg, attempt = 0) {
  const botNumber = `subbot-${phone}`;
  const sessionPath = path.join(SUBBOTS_DIR, botNumber);
  safeMkdir(sessionPath);

  // ✅ cargar DB una sola vez (igual que tu index)
  if (!databaseLoaded) {
    try {
      await global.loadDatabase();
      databaseLoaded = true;
      log.ok("Base de datos cargada (SubBot)");
    } catch (e) {
      log.err("No se pudo cargar la base de datos (SubBot)");
    }
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  // ✅ makeWASocket: CLON del index.js principal
  const client = makeWASocket({
    version,
    auth: state,
    browser: ["Ubuntu", "Chrome"],
    logger: pino({ level: "fatal" }),
    printQRInTerminal: false, // ✅ NO QR
    syncFullHistory: false,
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: false,
  });

  // ✅ IMPORTANTE: define decodeJid ANTES de usar smsg (así no se rompe)
  client.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      const d = jidDecode(jid) || {};
      return d.user && d.server ? `${d.user}@${d.server}` : jid;
    }
    return jid;
  };

  // ✅ evita ENOENT: asegurar carpeta antes de guardar creds
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

  // ✅ SOLO PAIRING CODE (igual que tu index.js)
  if (!state.creds.registered) {
    try {
      // pequeño delay para que no muera el stream
      await delay(1500);
      const code = await client.requestPairingCode(String(phone));
      log.ok(`[SubBot ${phone}] Código de vinculación: ${code}`);

      await sendText(
        `🔗 *Código de vinculación SubBot*\n` +
          `Número: *${phone}*\n` +
          `Código: *${code}*\n\n` +
          `WhatsApp (en el teléfono de ese número):\n` +
          `Dispositivos vinculados → Vincular un dispositivo → *Vincular con código*`
      );
    } catch (e) {
      log.err(`[SubBot ${phone}] No se pudo emparejar`);
      clearSession(sessionPath);
      await sendText(`❌ No se pudo generar el código para *${phone}*. Sesión limpiada. Intenta de nuevo: *.subbot ${phone}*`);
      try { client.end?.(); } catch {}
      throw e;
    }
  }

  // ✅ connection.update: parecido al principal, pero SIN process.exit()
  client.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "open") {
      log.ok(`[SubBot ${phone}] Bot conectado correctamente ✅`);
      await sendText(`✅ SubBot *${phone}* conectado. Ya debería ejecutar comandos igual que el principal.`);
      return;
    }

    if (connection === "close") {
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
      log.warn(`[SubBot ${phone}] Desconectado (${code})`);
      log.err(lastDisconnect?.error);

      // si sesión inválida, limpiar
      if (code === DisconnectReason.loggedOut || code === DisconnectReason.forbidden) {
        clearSession(sessionPath);
        await sendText(`🧹 SubBot *${phone}* deslogueado. Sesión limpiada. Ejecuta: *.subbot ${phone}*`);
        try { global.subBots?.delete?.(phone); } catch {}
        try { client.end?.(); } catch {}
        return;
      }

      // restartRequired / stream error: reconectar
      await delay(RECONNECT_DELAY);

      // reconexión controlada (máx 3 intentos)
      if (attempt < 3) {
        try { client.end?.(); } catch {}
        return startSubBot(phone, mainHandler, parentClient, parentMsg, attempt + 1);
      } else {
        await sendText(`⚠️ SubBot *${phone}* no pudo reconectar después de varios intentos. Ejecuta: *.subbot ${phone}*`);
        try { global.subBots?.delete?.(phone); } catch {}
        try { client.end?.(); } catch {}
      }
    }
  });

  // ✅ messages.upsert: CLON del principal
  client.ev.on("messages.upsert", async ({ messages }) => {
    try {
      const m = messages?.[0];
      if (!m?.message) return;
      if (m.key.remoteJid === "status@broadcast") return;

      const msg = smsg(client, m);
      await mainHandler(client, msg);
    } catch (e) {
      log.err(e);
    }
  });

  return client;
}

module.exports = { startSubBot };
