const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const fs = require("fs");
const path = require("path");
const { Boom } = require("@hapi/boom");

const { smsg } = require("./message");

const SUBBOT_SESS_DIR = path.join(__dirname, "../sessions/subbots");
const RECONNECT_DELAY = 3000;

function safeMkdir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function clearSession(dir) {
  try {
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}

/**
 * Inicia un SubBot (JadiBot/SerBot) con sesión propia.
 * - number: número en formato internacional SIN "+" (ej: 519xxxxxxxx)
 * - mainHandler: handler principal (main.js)
 * - conn/m: para poder responder con el código de emparejamiento en el chat
 */
async function startSubBot(number, mainHandler, conn, m) {
  if (typeof mainHandler !== "function") {
    throw new Error("mainHandler inválido (no es función)");
  }

  if (!number || !/^[0-9]{7,15}$/.test(String(number))) {
    throw new Error("Número inválido. Usa formato internacional, solo dígitos (ej: 519xxxxxxxx).");
  }

  safeMkdir(SUBBOT_SESS_DIR);

  const sessionPath = path.join(SUBBOT_SESS_DIR, `subbot-${number}`);
  safeMkdir(sessionPath);

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: "fatal" }),
    printQRInTerminal: false,
    browser: ["Killua-SubBot", "Chrome", "1.0"],
    syncFullHistory: false,
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: false,
  });

  // Emparejamiento por código (igual que el bot principal)
  if (!state.creds.registered) {
    try {
      const code = await sock.requestPairingCode(String(number));
      if (m?.reply) {
        await m.reply(`🔗 *Código de emparejamiento SubBot*\nNúmero: *${number}*\nCódigo: *${code}*\n\nAbre WhatsApp → Dispositivos vinculados → Vincular un dispositivo → Vincular con código.`);
      } else if (conn?.sendMessage) {
        await conn.sendMessage(conn.user.id, { text: `Código SubBot (${number}): ${code}` });
      }
    } catch (e) {
      clearSession(sessionPath);
      throw new Error("No se pudo generar el código de emparejamiento. Verifica el número e intenta de nuevo.");
    }
  }

  sock.ev.on("creds.update", saveCreds);

  // Re-conexión / limpieza de sesión
  sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "close") {
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode;

      if (code === DisconnectReason.loggedOut || code === DisconnectReason.forbidden) {
        clearSession(sessionPath);
      }

      // Intento simple de reconexión
      setTimeout(() => {
        startSubBot(number, mainHandler, conn, m).catch(() => {});
      }, RECONNECT_DELAY);
    }
  });

  // Mensajes -> smsg -> mainHandler
  sock.ev.on("messages.upsert", async ({ messages }) => {
    try {
      const mSubRaw = messages?.[0];
      if (!mSubRaw?.message) return;
      if (mSubRaw.key?.remoteJid === "status@broadcast") return;

      const msg = smsg(sock, mSubRaw);
      await mainHandler(sock, msg);
    } catch (e) {
      console.log("❌ Error en el handler del subbot:", e);
    }
  });

  return sock;
}

module.exports = { startSubBot };
