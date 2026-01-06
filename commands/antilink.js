const fs = require("fs")
const path = require("path")

const DB_PATH = path.join(__dirname, "../database/antilink.json")

if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({}))
}

const loadDB = () => JSON.parse(fs.readFileSync(DB_PATH))
const saveDB = data => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))

/* ===== REGEX REAL PARA WHATSAPP ===== */
const WA_LINK_REGEX =
  /(chat\.whatsapp\.com\/|whatsapp\.com\/channel\/)/i

/* ===== COMANDO ===== */
module.exports = {
  command: ["antilink"],
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,

  run: async (client, m, args) => {
    const db = loadDB()

    if (!args[0]) {
      return m.reply(
        `🔒 *Antilink*\n\n` +
        `Estado: *${db[m.chat] ? "ON ✅" : "OFF ❌"}*\n\n` +
        `Usa:\n` +
        `• .antilink on\n` +
        `• .antilink off`
      )
    }

    if (args[0] === "on") {
      db[m.chat] = true
      saveDB(db)
      return m.reply("✅ Antilink activado")
    }

    if (args[0] === "off") {
      delete db[m.chat]
      saveDB(db)
      return m.reply("❌ Antilink desactivado")
    }
  },

  /* ===== VERIFICAR SI ESTA ACTIVO ===== */
  isActive: chat => {
    const db = loadDB()
    return db[chat] === true
  },

  /* ===== EJECUTAR ANTILINK ===== */
  execute: async (client, m) => {
    try {
      if (!WA_LINK_REGEX.test(m.text || "")) return

      const sender = m.sender
      const metadata = await client.groupMetadata(m.chat)

      const admins = metadata.participants
        .filter(p => p.admin)
        .map(p => p.id)

      // ❌ NO TOCAR ADMINS
      if (admins.includes(sender)) return

      // 🧹 BORRAR MENSAJE
      await client.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: m.key.id,
          participant: sender,
        },
      })

      // ⚠️ ADVERTENCIA
      await client.sendMessage(m.chat, {
        text: `🚫 @${sender.split("@")[0]} enlaces de WhatsApp no permitidos`,
        mentions: [sender],
      })

    } catch (e) {
      console.log("[ANTILINK ERROR]", e)
    }
  },
}
