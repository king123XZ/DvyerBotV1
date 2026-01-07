const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  jidDecode,
  DisconnectReason,
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const fs = require("fs");
const path = require("path");
const { Boom } = require("@hapi/boom");

const { smsg } = require("./message"); // ✅ si tu smsg real está en ./lib/message, cambia a: require("../lib/message")

if (!global.subBots) global.subBots = new Map();

const SUBBOT_SESS_DIR = path.join(__dirname, "../sessions/subbots");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function safeMkdir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function clearSession(dir) {
  try {
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}

async function startSubBot(number, mainHandler, parentClient, m, attempt = 0) {
  if (typeof mainHandler !== "function") throw new Error("mainHandler inválido");
  if (!number || !/^[0-9]{7,15}$/.test(String(number))) {
    throw new Error("Número inválido. Ej: 519xxxxxxxx (solo dígitos)");
  }

  safeMkdir(SUBBOT_SESS_DIR);
  const sessionPath = path.join(SUBBOT_SESS_DIR, `subbot-${number}`);
  safeMkdir(sessionPath);

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  // ✅ Socket igual al principal (index.js)
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

  // ✅ CLAVE: define decodeJid como el bot principal (si no, smsg se rompe y no hay comandos)
  client.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      const d = jidDecode(jid) || {};
      return d.user && d.server ? `${d.user}@${d.server}` : jid;
    }
    return jid;
  };

  // ✅ evita ENOENT: siempre asegura carpeta antes de escribir creds
  client.ev.on("creds.update", async () => {
    safeMkdir(sessionPath);
    await saveCreds();
  });

  const sendText = async (text) => {
    try {
      if (m?.reply) return await m.reply(text);
      if (parentClient?.sendMessage) return await parentClient.sendMessage(parentClient.user.id, { text });
    } catch {}
  };

  // ✅ Pairing code ONLY (igual que principal)
  (async () => {
    if (state.creds.registered) return;

    await sleep(2000);

    for (let i = 1; i <= 6; i++) {
      try {
        const code = await client.requestPairingCode(String(number));

        console.log(`[SubBot ${number}] Código de vinculación: ${code}`);

        await sendText(
          `🔗 *Código de vinculación SubBot*\n` +
            `Número: *${number}*\n` +
            `Código: *${code}*\n\n` +
            `WhatsApp (teléfono): Dispositivos vinculados → Vincular un dispositivo → *Vincular con código*`
        );
        return;
      } catch (e) {
        await sleep(1200 + i * 250);
      }
    }

    await sendText(`⚠️ No pude generar el código para *${number}*. Reintenta: *.subbot ${number}*`);
  })().catch(() => {});

  client.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "open") {
      console.log(`[SubBot ${number}] Conectado ✅`);
      await sendText(`✅ SubBot *${number}* conectado y listo (mismo handler del bot principal).`);
      return;
    }

    if (connection === "close") {
      const boom = new Boom(lastDisconnect?.error);
      const code = boom?.output?.statusCode;

      console.log(`[SubBot ${number}] Connection closed. Code=${code}`);
      console.log(`[SubBot ${number}] lastDisconnect.error =`, lastDisconnect?.error);

      // Sesión inválida -> limpiar
      if (
        code === DisconnectReason.loggedOut ||
        code === DisconnectReason.forbidden ||
        code === DisconnectReason.badSession ||
        code === 401
      ) {
        clearSession(sessionPath);
        global.subBots.delete(number);
        await sendText(`🧹 Sesión inválida. Ejecuta otra vez: *.subbot ${number}*`);
        try { client.end?.(); } catch {}
        return;
      }

      // 515 restartRequired -> reconectar
      if (code === DisconnectReason.restartRequired || code === 515) {
        try { client.end?.(); } catch {}
        await sleep(2500);
        return startSubBot(number, mainHandler, parentClient, m, attempt + 1);
      }

      // cierres comunes -> reintentar pocas veces
      if ((code === DisconnectReason.connectionClosed || code === 428) && attempt < 2) {
        try { client.end?.(); } catch {}
        await sleep(2500);
        return startSubBot(number, mainHandler, parentClient, m, attempt + 1);
      }

      global.subBots.delete(number);
      try { client.end?.(); } catch {}
    }
  });

  // ✅ Mensajes -> smsg -> mainHandler (igual que index.js)
  client.ev.on("messages.upsert", async ({ messages }) => {
    try {
      const mm = messages?.[0];
      if (!mm?.message) return;
      if (mm.key.remoteJid === "status@broadcast") return;

      const msg = smsg(client, mm); // ✅ ahora sí, porque decodeJid existe
      await mainHandler(client, msg);
    } catch (e) {
      console.log("❌ SubBot messages.upsert error:", e);
    }
  });

  return client;
}

module.exports = { startSubBot };
