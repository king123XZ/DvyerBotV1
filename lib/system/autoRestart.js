const fs = require("fs")
const os = require("os")
const monitor = require("./monitor")

const CHECK_INTERVAL = 15_000
const SAFE_FREE_MB = 200 // lo que quieres que quede libre

let restarting = false
let notified = false

function bytesToMB(b) {
  return b / 1024 / 1024
}

// 🔍 Detectar RAM real del contenedor (Docker / Pterodactyl)
function getTotalRAM() {
  try {
    // Docker cgroup v1 / v2
    const paths = [
      "/sys/fs/cgroup/memory/memory.limit_in_bytes",
      "/sys/fs/cgroup/memory.max",
    ]

    for (const p of paths) {
      if (fs.existsSync(p)) {
        const v = fs.readFileSync(p, "utf8").trim()
        const limit = parseInt(v)
        if (!isNaN(limit) && limit > 0 && limit < os.totalmem()) {
          return limit
        }
      }
    }
  } catch {}

  // Fallback: RAM del sistema
  return os.totalmem()
}

const TOTAL_RAM_MB = Math.floor(bytesToMB(getTotalRAM()))
const RESTART_AT_MB = TOTAL_RAM_MB - SAFE_FREE_MB

console.log(
  `🧠 RAM detectada: ${TOTAL_RAM_MB} MB | Reinicio a partir de ${RESTART_AT_MB} MB`
)

async function notifyOwner(client, text) {
  try {
    if (!global.owner?.length) return
    const jid = global.owner[0] + "@s.whatsapp.net"
    await client.sendMessage(jid, { text })
  } catch {}
}

async function checkHealth(client) {
  if (restarting) return

  const ramUsed = bytesToMB(process.memoryUsage().rss)
  const stats = monitor.getStats()

  if (ramUsed >= RESTART_AT_MB) {
    restarting = true

    const msg = `
🚨 *AUTO-RESTART PREVENTIVO*

🧠 RAM usada: ${ramUsed.toFixed(0)} MB
📉 RAM total: ${TOTAL_RAM_MB} MB
📉 RAM libre: ${(TOTAL_RAM_MB - ramUsed).toFixed(0)} MB

📡 Latencia: ${stats.latency} ms
⏱️ Uptime: ${stats.uptime}

♻️ Reinicio en 5 segundos...
`.trim()

    console.log("🚨 RAM CRÍTICA:", ramUsed.toFixed(0), "MB")

    if (!notified) {
      notified = true
      await notifyOwner(client, msg)
    }

    setTimeout(() => {
      console.log("♻️ Reiniciando bot...")
      process.exit(0)
    }, 5000)
  }
}

function startAutoRestart(client) {
  setInterval(() => checkHealth(client), CHECK_INTERVAL)
}

module.exports = {
  startAutoRestart,
}
