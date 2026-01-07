/*************************************************
                  dvyer
 * Node.js 18.x / 20.x LTS
 *************************************************/

require("./settings")
require("./lib/database")

const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  jidDecode,
  DisconnectReason,
} = require("@whiskeysockets/baileys")

const pino = require("pino")
const chalk = require("chalk")
const fs = require("fs")
const path = require("path")
const os = require("os")
const readline = require("readline")
const { Boom } = require("@hapi/boom")

const { smsg } = require("./lib/message")
const welcome = require("./lib/system/welcome")
const mainHandler = require("./main")

const { startAutoRestart } = require("./lib/system/autoRestart")

const SESSIONS_DIR = path.join(__dirname, "sessions")
const RECONNECT_DELAY = 3000
let databaseLoaded = false

// ================= UTILS =================
const delay = ms => new Promise(r => setTimeout(r, ms))

const log = {
  info: m => console.log(chalk.cyan("[INFO]"), m),
  ok: m => console.log(chalk.green("[OK]"), m),
  warn: m => console.log(chalk.yellow("[WARN]"), m),
  err: m => console.log(chalk.red("[ERROR]"), m),
}

const question = q => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  return new Promise(res =>
    rl.question(q, a => {
      rl.close()
      res(a.trim())
    })
  )
}

const safeMkdir = d => !fs.existsSync(d) && fs.mkdirSync(d, { recursive: true })
const clearSession = d => fs.rmSync(d, { recursive: true, force: true })

console.log(chalk.yellow("════════════════════════════"))
log.info(`OS: ${os.platform()} ${os.arch()}`)
log.info(`Node: ${process.version}`)
log.info(`RAM libre: ${(os.freemem() / 1024 / 1024).toFixed(0)} MB`)
log.info(`Hora: ${new Date().toLocaleString("es-PE", { hour12: false })}`)
console.log(chalk.yellow("════════════════════════════"))

async function startBot(botNumber = "main") {
  const sessionPath = path.join(SESSIONS_DIR, botNumber)
  safeMkdir(sessionPath)

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
  const { version } = await fetchLatestBaileysVersion()

  const client = makeWASocket({
    version,
    auth: state,
    browser: ["Ubuntu", "Chrome"],
    logger: pino({ level: "fatal" }),
    printQRInTerminal: false,
    syncFullHistory: false,
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: false,
  })

  if (!state.creds.registered) {
    const phone = await question("📱 Número WhatsApp (519xxxxxxxx): ")
    try {
      const code = await client.requestPairingCode(phone)
      log.ok(`Código de vinculación: ${code}`)
    } catch (e) {
      log.err("No se pudo emparejar")
      clearSession(sessionPath)
      process.exit(1)
    }
  }


  if (!databaseLoaded) {
    await global.loadDatabase()
    databaseLoaded = true
    log.ok("Base de datos cargada")
  }


  client.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "close") {
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode
      log.warn(`Desconectado (${code})`)

      if (
        code === DisconnectReason.loggedOut ||
        code === DisconnectReason.forbidden
      ) {
        clearSession(sessionPath)
      }

      await delay(RECONNECT_DELAY)
      process.exit(0)
    }

    if (connection === "open") {
      log.ok("Bot conectado correctamente")

      
      startAutoRestart(client)
      log.ok("Auto-restart inteligente activo")
    }
  })


  client.ev.on("messages.upsert", async ({ messages }) => {
    try {
      const m = messages?.[0]
      if (!m?.message) return
      if (m.key.remoteJid === "status@broadcast") return

      const msg = smsg(client, m)
      await mainHandler(client, msg)
    } catch (e) {
      log.err(e)
    }
  })


  client.ev.on("group-participants.update", async u => {
    try {
      await welcome(client, u)
    } catch {}
  })

  client.decodeJid = jid => {
    if (!jid) return jid
    if (/:\d+@/gi.test(jid)) {
      const d = jidDecode(jid) || {}
      return d.user && d.server ? `${d.user}@${d.server}` : jid
    }
    return jid
  }

  client.ev.on("creds.update", saveCreds)
}

process.on("unhandledRejection", e => log.err(e))
process.on("uncaughtException", e => log.err(e))

startBot()

fs.watchFile(__filename, () => {
  console.log(chalk.yellow("♻ Reiniciando bot..."))
  process.exit(0)
})

