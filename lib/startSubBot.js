const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const fs = require("fs");
const path = require("path");

async function startSubBot(number, mainHandler, conn, m) {
  // Verificación de seguridad para evitar el error "no es función"
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
      // Si la sesión se cierra o falla, eliminamos la carpeta (instrucción guardada)
      if (
        reason === DisconnectReason.loggedOut ||
        reason === DisconnectReason.badSession
      ) {
        if (fs.existsSync(sessionPath)) {
          fs.rmSync(sessionPath, { recursive: true, force: true });
          console.log(`🗑️ Carpeta del subbot eliminada: ${number}`);
        }
      }
    }

    if (connection === "open") {
      console.log(`✅ Subbot conectado con éxito: ${number}`);
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const mSub = messages[0];
    if (!mSub?.message) return;

    try {
      // Ejecuta la lógica principal del bot
      await mainHandler(sock, mSub);
    } catch (e) {
      console.log("❌ Error en el handler del subbot:", e);
    }
  });

  return sock;
}

module.exports = { startSubBot };
