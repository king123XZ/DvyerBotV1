const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
} = require("@whiskeysockets/baileys")

const P = require("pino")
const fs = require("fs")
const path = require("path")
const mainHandler = require("../main")

async function delay(ms) {
  return new Promise(res => setTimeout(res, ms))
}

async function startSubBot(ownerJid, botId) {
  const sessionPath = path.join(__dirname, "../sessions", botId)
  fs.mkdirSync(sessionPath, { recursive: true })

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
  const { version } = await fetchLatestBaileysVersion()

  const client = makeWASocket({
    version,
    logger: P({ level: "silent" }),
    auth: state,
    printQRInTerminal: false,
    browser: ["SubBot", "Chrome", "1.0"]
  })

  client.ev.on("creds.update", saveCreds)

  // 🔑 PEDIR PAIRING SOLO UNA VEZ
  client.ev.on("connection.update", async ({ connection }) => {
    if (connection === "open" && !client.authState.creds.registered) {
      await delay(5000)

      try {
        const code = await client.requestPairingCode(
          ownerJid.split("@")[0]
        )

        await client.sendMessage(ownerJid, {
          text:
            `🤖 *SUB-BOT*\n\n` +
            `📲 Código de vinculación:\n\n` +
            `*${code}*\n\n` +
            `WhatsApp > Dispositivos vinculados`
        })

      } catch (err) {
        console.log("❌ SUBBOT PAIR ERROR:", err)
      }
    }
  })

  // 📩 MENSAJES
  client.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0]
    if (!m?.message) return
    await mainHandler(client, m)
  })

  console.log("🟢 SubBot iniciado:", botId)
  return client
}

module.exports = { startSubBot }