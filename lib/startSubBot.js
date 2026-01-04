const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const fs = require("fs");
const path = require("path");

async function startSubBot(number, mainHandler) {
  if (typeof mainHandler !== "function") {
    throw new Error("mainHandler inválido (no es función)");
  }

  const sessionPath = path.join(__dirname, "../sessions/subbot-" + number);
  if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    browser: ["Star-SubBot", "Chrome", "1.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      if (
        reason === DisconnectReason.loggedOut ||
        reason === DisconnectReason.badSession
      ) {
        fs.rmSync(sessionPath, { recursive: true, force: true });
        console.log(`🗑️ Subbot eliminado: ${number}`);
      }
    }

    if (connection === "open") {
      console.log(`✅ Subbot conectado: ${number}`);
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0];
    if (!m?.message) return;

    try {
      await mainHandler(sock, m);
    } catch (e) {
      console.log("❌ Error subbot:", e);
    }
  });

  return sock;
}

module.exports = { startSubBot };