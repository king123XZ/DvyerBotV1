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

function safeMkdir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function clearSession(dir) {
  try {
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}

function prettyDisconnect(code) {
  const map = {
    [DisconnectReason.loggedOut]: "loggedOut",
    [DisconnectReason.forbidden]: "forbidden",
    [DisconnectReason.connectionClosed]: "connectionClosed",
    [DisconnectReason.connectionLost]: "connectionLost",
    [DisconnectReason.connectionReplaced]: "connectionReplaced",
    [DisconnectReason.restartRequired]: "restartRequired",
    [DisconnectReason.timedOut]: "timedOut",
    [DisconnectReason.badSession]: "badSession",
  };
  return map[code] || String(code);
}

async function startSubBot(number, mainHandler, client, m) {
  if (typeof mainHandler !== "function") throw new Error("mainHandler inválido (no es función)");
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
    printQRInTerminal: true, // ✅ por si el envío al chat falla, al menos lo ves en consola
    browser: ["Killua-SubBot", "Chrome", "1.0"],
    syncFullHistory: false,
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: false,
    connectTimeoutMs: 60_000,
    defaultQueryTimeoutMs: 60_000,
    keepAliveIntervalMs: 20_000,
  });

  sock.ev.on("creds.update", saveCreds);

  const sendText = async (text) => {
    try {
      if (m?.reply) return await m.reply(text);
      if (client?.sendMessage) return await client.sendMessage(client.user.id, { text });
    } catch {}
  };

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update || {};

    if (connection === "open") {
      console.log(`[SubBot ${number}] Connected ✅`);
      await sendText(`✅ SubBot *${number}* conectado.`);
      return;
    }

    if (connection === "close") {
      const boom = new Boom(lastDisconnect?.error);
      const code = boom?.output?.statusCode;
      const reason = prettyDisconnect(code);

      // ✅ LOG REAL (esto es lo que necesitamos ver)
      console.log(`[SubBot ${number}] Connection closed. Code=${code} Reason=${reason}`);
      console.log(`[SubBot ${number}] lastDisconnect.error =`, lastDisconnect?.error);

      // Mensaje al chat para que tú también lo veas
      await sendText(
        `⚠️ SubBot *${number}* se cerró.\n` +
        `Code: *${code}* (${reason})\n` +
        `Si vuelve a pasar, copia el log del servidor (lastDisconnect.error).`
      );

      // Si está deslogueado / sesión mala -> borrar sesión
      if (
        code === DisconnectReason.loggedOut ||
        code === DisconnectReason.badSession ||
        code === DisconnectReason.forbidden
      ) {
        clearSession(sessionPath);
        await sendText(`🧹 Sesión SubBot limpiada. Ejecuta de nuevo: *.subbot ${number}*`);
      }

      try { sock.end?.(); } catch {}
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    try {
      const raw = messages?.[0];
      if (!raw?.message) return;
      if (raw.key?.remoteJid === "status@broadcast") return;

      const msg = smsg(sock, raw);
      await mainHandler(sock, msg);
    } catch (e) {
      console.log("❌ Error en el handler del subbot:", e);
    }
  });

  return sock;
}

module.exports = { startSubBot };
