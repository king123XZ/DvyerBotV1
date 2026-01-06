require("./settings")
const fs = require("fs")
const chalk = require("chalk")

const seeCommands = require("./lib/system/commandLoader")
const initDB = require("./lib/system/initDB")
const antilink = require("./commands/antilink")
const { resolveLidToRealJid } = require("./lib/utils")

/* ===== LOAD COMMANDS ===== */
seeCommands()

/* ===== CACHE & PROTECTIONS ===== */
const groupCache = new Map()
const cooldown = new Map()
const GROUP_TTL = 2 * 60 * 1000 // 2 min
const COOLDOWN_MS = 2500

/* ===== CLEAN MEMORY ===== */
setInterval(() => {
  groupCache.clear()
  cooldown.clear()
}, 10 * 60 * 1000)

/* ===== COOLDOWN ===== */
function inCooldown(sender, command) {
  const key = sender + command
  const now = Date.now()
  if (cooldown.has(key) && now < cooldown.get(key)) return true
  cooldown.set(key, now + COOLDOWN_MS)
  return false
}

/* ===== MAIN HANDLER ===== */
async function mainHandler(client, m) {
  try {
    if (!m?.message) return

    const body =
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      m.message.imageMessage?.caption ||
      m.message.videoMessage?.caption ||
      m.message.buttonsResponseMessage?.selectedButtonId ||
      m.message.listResponseMessage?.singleSelectReply?.selectedRowId ||
      m.message.templateButtonReplyMessage?.selectedId ||
      ""

    if (!body) return

    try { initDB(m) } catch {}

    const prefixes = [".", "!", "#", "/"]
    const prefix = prefixes.find(p => body.startsWith(p))

    // 🔒 ANTILINK solo si hay link
    if (!prefix && m.isGroup && /https?:\/\//i.test(body)) {
      await antilink(client, m)
      return
    }

    if (!prefix) return

    const args = body.trim().split(/\s+/).slice(1)
    const text = args.join(" ")
    const command = body.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase()

    if (!global.comandos?.has(command)) return
    const cmd = global.comandos.get(command)

    const sender = m.sender || m.key?.participant
    if (!sender) return

    if (inCooldown(sender, command))
      return m.reply("⏳ Espera un momento...")

    const from = m.chat
    const botJid = client.user.id.split(":")[0] + "@s.whatsapp.net"

    let isAdmins = false
    let isBotAdmins = false
    let groupName = ""

    if (m.isGroup) {
      let cached = groupCache.get(from)

      if (!cached || cached.expires < Date.now()) {
        const meta = await client.groupMetadata(from).catch(() => null)
        if (meta) {
          const admins = meta.participants
            .filter(p => p.admin)
            .map(p => p.jid)

          const resolved = await Promise.all(
            admins.map(j => resolveLidToRealJid(j, client, from).catch(() => j))
          )

          cached = {
            admins: resolved,
            subject: meta.subject || "",
            expires: Date.now() + GROUP_TTL,
          }

          groupCache.set(from, cached)
        }
      }

      if (cached) {
        groupName = cached.subject
        isAdmins = cached.admins.includes(sender)
        isBotAdmins = cached.admins.includes(botJid)
      }
    }

    const isOwner = global.owner
      .map(o => o + "@s.whatsapp.net")
      .includes(sender)

    if (cmd.isOwner && !isOwner) return m.reply("⚠️ Solo el owner.")
    if (cmd.isGroup && !m.isGroup) return m.reply("⚠️ Solo en grupos.")
    if (cmd.isAdmin && !isAdmins) return m.reply("⚠️ Debes ser admin.")
    if (cmd.isBotAdmin && !isBotAdmins) return m.reply("⚠️ Necesito admin.")

    console.log(
      chalk.green("[CMD]"),
      chalk.cyan(command),
      "|",
      chalk.white(sender),
      chalk.gray(m.isGroup ? groupName : "Privado")
    )

    try {
      await cmd.run(client, m, args, { text, prefix, command })
    } catch (err) {
      console.log(chalk.red("CMD ERROR:"), command, err)
      m.reply("⚠️ Error interno del comando.")
    }

  } catch (e) {
    console.log(chalk.red("MAIN ERROR:"), e)
  }
}

/* ===== EXPORT ===== */
module.exports = mainHandler

/* ===== HOT RELOAD ===== */
const file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  delete require.cache[file]
  require(file)
  console.log(chalk.yellow("♻ main.js recargado"))
})

