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
    throw new Error("❌ mainHandler inválido (no es función)");
  }

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

  /* ===== AUTO BORRADO ===== */
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

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
  });

  /* ===== MENSAJES ===== */
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0];
    if (!m?.message) return;

    try {
      await mainHandler(sock, m);
    } catch (e) {
      console.log("❌ Error subbot:", e);
    }
  });

  /* ===== CÓDIGO ===== */
  if (!state.creds.registered) {
    const code = await sock.requestPairingCode(number);
    return { sock, code };
  }

  return { sock };
}

module.exports = { startSubBot };