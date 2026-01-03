const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys")

const P = require("pino")
const fs = require("fs")
const path = require("path")

async function delay(ms) {
  return new Promise(res => setTimeout(res, ms))
}

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
    printQRInTerminal: false,
    connectTimeoutMs: 60_000,
    defaultQueryTimeoutMs: 60_000
  })

  sock.ev.on("creds.update", saveCreds)

  // usar tu main.js
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0]
    if (!m?.message) return
    m.isGroup = m.key.remoteJid.endsWith("@g.us")
    m.chat = m.key.remoteJid
    m.sender = m.key.participant || m.key.remoteJid
    m.pushName = m.pushName || "SubBotUser"
    await handler(sock, m)
  })

  let pairingSent = false

  sock.ev.on("connection.update", async (update) => {
    const { connection } = update

    // ESPERAR conexión real
    if (connection === "open" && !pairingSent && !sock.authState.creds.registered) {
      pairingSent = true

      await delay(5000) // 🔥 CLAVE

      try {
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

      } catch (err) {
        console.log("PAIRING ERROR:", err)
        throw err
      }
    }
  })

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (
      connection === "close" &&
      lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
    ) {
      console.log("🔁 Reintentando subbot…")
    }
  })
}

module.exports = { createSubBot }