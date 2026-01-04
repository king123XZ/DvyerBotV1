const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const fs = require("fs");
const path = require("path");

let mainHandler = require("../main");
if (typeof mainHandler !== "function") {
  mainHandler = mainHandler?.default || mainHandler?.mainHandler;
}

async function startSubBot(jid) {
  if (typeof mainHandler !== "function") {
    console.error("❌ mainHandler inválido");
    return;
  }

  const sessionPath = path.join(__dirname, "../sessions", jid);
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    browser: ["Star-SubBot", "Chrome", "1.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;

      if (
        reason === DisconnectReason.loggedOut ||
        reason === DisconnectReason.badSession
      ) {
        fs.rmSync(sessionPath, { recursive: true, force: true });
        console.log(`🗑️ Sesión eliminada: ${jid}`);
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0];
    if (!m?.message) return;
    try {
      await mainHandler(sock, m);
    } catch (e) {
      console.log("Error subbot:", e);
    }
  });

  return sock;
}

module.exports = { startSubBot };