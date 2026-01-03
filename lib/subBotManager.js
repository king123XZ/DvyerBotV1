const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys")

const P = require("pino")
const path = require("path")
const fs = require("fs")

async function createSubBot(ownerJid, handler) {
  const sessionDir = path.join(
    __dirname,
    "../sessions",
    `subbot-${Date.now()}`
  )

  fs.mkdirSync(sessionDir, { recursive: true })

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir)

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: "silent" }),
    printQRInTerminal: false
  })

  sock.ev.on("creds.update", saveCreds)

  // 👉 reenviar mensajes al MISMO main.js
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0]
    if (!m?.message) return
    m.isGroup = m.key.remoteJid.endsWith("@g.us")
    m.chat = m.key.remoteJid
    m.sender = m.key.participant || m.key.remoteJid
    m.pushName = m.pushName || "SubBotUser"

    await handler(sock, m)
  })

  // 🔑 Código de vinculación
  if (!sock.authState.creds.registered) {
    const code = await sock.requestPairingCode(
      ownerJid.split("@")[0]
    )

    await sock.sendMessage(ownerJid, {
      text:
        `🤖 *SUB-BOT*\n\n` +
        `📲 Vincula tu WhatsApp con este código:\n\n` +
        `*${code}*\n\n` +
        `WhatsApp > Dispositivos vinculados`
    })
  }

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update

    if (connection === "open") {
      console.log("✅ SubBot conectado:", sock.user.id)
    }

    if (
      connection === "close" &&
      lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
    ) {
      console.log("🔁 Reconectando subbot…")
      createSubBot(ownerJid, handler)
    }
  })
}

module.exports = { createSubBot }