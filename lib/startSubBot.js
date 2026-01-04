const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const fs = require("fs");
const path = require("path");

/* ===== IMPORT SEGURO DEL MAIN ===== */
const mainFile = require("../main");
const mainHandler =
  typeof mainFile === "function"
    ? mainFile
    : mainFile.mainHandler || mainFile.default;

if (typeof mainHandler !== "function") {
  throw new Error("❌ mainHandler no es una función (export incorrecto)");
}

/* ===== START SUBBOT ===== */
async function startSubBot(number) {
  const sessionPath = path.join(__dirname, "../sessions", number);

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
        console.log(`🗑️ Sesión eliminada: ${number}`);
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0];
    if (!m?.message) return;

    try {
      await mainHandler(sock, m);
    } catch (err) {
      console.log("❌ Error subbot:", err);
    }
  });

  return sock;
}

module.exports = { startSubBot };