require("./settings")
const fs = require("fs")
const chalk = require("chalk")

const seeCommands = require("./lib/system/commandLoader")
const initDB = require("./lib/system/initDB")
const antilink = require("./commands/antilink")
const { resolveLidToRealJid } = require("./lib/utils")

// ===== CARGAR COMANDOS SOLO UNA VEZ =====
seeCommands()

// ===== CACHE Y COOLDOWN =====
const groupCache = new Map()
const cooldown = new Map()

const GROUP_TTL = 5 * 60 * 1000 // 5 minutos
const COOLDOWN_MS = 2000

// ===== LIMPIEZA AUTOMÁTICA =====
setInterval(() => {
  const now = Date.now()
  for (const [k, v] of groupCache) {
    if (v.expires < now) groupCache.delete(k)
  }
  cooldown.clear()
}, 10 * 60 * 1000)

// ===== COOLDOWN =====
function inCooldown(sender, command) {
  const key = sender + ":" + command
  const now = Date.now()
  const expire = cooldown.get(key)
  if (expire && now < expire) return true
  cooldown.set(key, now + COOLDOWN_MS)
  return false
}

// ===== MAIN HANDLER =====
async function mainHandler(client, m) {
  try {
    if (!m?.message) return

    // ===== TEXTO UNIFICADO =====
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

    // ===== DB (NO BLOQUEA) =====
    try { initDB(m) } catch {}

    const sender = m.sender || m.key?.participant
    if (!sender) return

    const from = m.chat
    const isGroup = m.isGroup
    const botJid = client.user.id.split(":")[0] + "@s.whatsapp.net"

    // ===== PREFIJOS =====
    const prefixes = [".", "!", "#", "/"]
    const prefix = prefixes.find(p => body.startsWith(p))

    // =================================================
    // ================= ANTILINK ======================
    // =================================================
    if (
      !prefix &&
      isGroup &&
      /chat\.whatsapp\.com\/|whatsapp\.com\/channel\//i.test(body) &&
      typeof antilink.isActive === "function" &&
      typeof antilink.execute === "function" &&
      antilink.isActive(from)
    ) {
      let cached = groupCache.get(from)

      if (!cached || cached.expires < Date.now()) {
        const meta = await client.groupMetadata(from).catch(() => null)
        if (meta) {
          cached = {
            admins: meta.participants.filter(p => p.admin).map(p => p.jid),
            subject: meta.subject || "",
            expires: Date.now() + GROUP_TTL
          }
          groupCache.set(from, cached)
        }
      }

      const isOwner = global.owner
        .map(o => o + "@s.whatsapp.net")
        .includes(sender)

      const isAdmin = cached?.admins.includes(sender)
      const isBot = sender === botJid

      if (!isOwner && !isAdmin && !isBot) {
        await antilink.execute(client, m)
      }
      return
    }

    // ===== SI NO ES COMANDO, SALIR =====
    if (!prefix) return

    // ===== PARSEO COMANDO =====
    const args = body.slice(prefix.length).trim().split(/\s+/)
    const command = args.shift().toLowerCase()
    const text = args.join(" ")

    if (!global.comandos?.has(command)) return
    const cmd = global.comandos.get(command)

    // ===== COOLDOWN =====
    if (inCooldown(sender, command)) {
      return m.reply("⏳ Espera un momento...")
    }

    // ===== DATOS DE GRUPO =====
    let isAdmins = false
    let isBotAdmins = false
    let groupName = ""

    if (isGroup) {
      let cached = groupCache.get(from)

      if (!cached || cached.expires < Date.now()) {
        const meta = await client.groupMetadata(from).catch(() => null)
        if (meta) {
          const admins = meta.participants
            .filter(p => p.admin)
            .map(p => p.jid)

          const resolvedAdmins = await Promise.all(
            admins.map(j =>
              resolveLidToRealJid(j, client, from).catch(() => j)
            )
          )

          cached = {
            admins: resolvedAdmins,
            subject: meta.subject || "",
            expires: Date.now() + GROUP_TTL
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

    // ===== PERMISOS =====
    const isOwner = global.owner
      .map(o => o + "@s.whatsapp.net")
      .includes(sender)

    if (cmd.isOwner && !isOwner) return m.reply("⚠️ Solo el owner.")
    if (cmd.isGroup && !isGroup) return m.reply("⚠️ Solo en grupos.")
    if (cmd.isAdmin && !isAdmins) return m.reply("⚠️ Debes ser admin.")
    if (cmd.isBotAdmin && !isBotAdmins) return m.reply("⚠️ Necesito admin.")

    // ===== LOG =====
    console.log(
      chalk.green("[CMD]"),
      chalk.cyan(command),
      "|",
      chalk.white(sender),
      chalk.gray(isGroup ? groupName : "Privado")
    )

    // ===== EJECUTAR COMANDO =====
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

// ===== EXPORT =====
global.mainHandler = mainHandler
module.exports = mainHandler

// ===== HOT RELOAD =====
const file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  delete require.cache[file]
  require(file)
  console.log(chalk.yellow("♻ main.js recargado"))
})

