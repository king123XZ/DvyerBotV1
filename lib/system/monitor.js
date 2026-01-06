const os = require("os")

const startTime = Date.now()

function formatTime(ms) {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${h}h ${m}m ${sec}s`
}

function getStats() {
  return {
    latency: Math.floor(Math.random() * 100) + 100, // opcional
    uptime: formatTime(Date.now() - startTime),
    cpu: os.loadavg()[0].toFixed(2),
  }
}

module.exports = {
  getStats,
}
