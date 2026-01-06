require("./settings")
const fs = require("fs")
const path = require("path")
const chalk = require("chalk")

const seeCommands = require("./lib/system/commandLoader")
const initDB = require("./lib/system/initDB")
const antilink = require("./commands/antilink")
const { resolveLidToRealJid } = require("./lib/utils")

/* ===== CARGAR COMANDOS UNA SOLA VEZ ===== */
seeCommands()

/* ===== CACHE ===== */
const groupCache = new Map() // jid => { admins, subject, expires }
const GROUP_CACHE_TTL = 30 * 1000 // 30s

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

    // DB SAFE
    try { initDB(m) } catch {}

    // PREFIJO
    const prefixes = [".", "!", "#", "/"]
    const prefix = prefixes.find(p => body.startsWith(p))
    if (!prefix) {
      if (m.isGroup) {
        try { await antilink(client, m) } catch {}
      }
      return
    }

    const args = body.trim().split(/\s+/).slice(1)
    const text = args.join(" ")
    const command = body.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase()

    if (!global.comandos?.has(command)) return
    const cmd = global.comandos.get(command)

    const sender = m.sender || m.key?.participant
    if (!sender) return

    const from = m.chat
    const botJid = client.user.id.split(":")[0] + "@s.whatsapp.net"

    let isAdmins = false
    let isBotAdmins = false
    let groupName = ""

    /* ===== GROUP CACHE ===== */
    if (m.isGroup) {
      let cached = groupCache.get(from)

      if (!cached || cached.expires < Date.now()) {
        const metadata = await client.groupMetadata(from).catch(() => null)
        if (metadata) {
          const admins = metadata.participants
            .filter(p => p.admin)
            .map(p => p.jid)

          const resolvedAdmins = await Promise.all(
            admins.map(j =>
              resolveLidToRealJid(j, client, from).catch(() => j)
            )
          )

          cached = {
            admins: resolvedAdmins,
            subject: metadata.subject || "",
            expires: Date.now() + GROUP_CACHE_TTL,
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

    // ===== PERMISOS =====
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

    await cmd.run(client, m, args, { text, prefix, command })

  } catch (e) {
    console.log(chalk.red("🔥 MAIN ERROR:"), e)
  }
}

/* ===== EXPORT ===== */
module.exports = mainHandler
module.exports.mainHandler = mainHandler

/* ===== HOT RELOAD ===== */
const mainFile = require.resolve(__filename)
fs.watchFile(mainFile, () => {
  fs.unwatchFile(mainFile)
  delete require.cache[mainFile]
  require(mainFile)
  console.log(chalk.yellow("♻ main.js recargado"))
})
