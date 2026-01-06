const fs = require("fs")

// Guardar estado por grupo
const antilinkDB = new Set()

// Regex links WhatsApp (grupo / canal)
const WA_LINK_REGEX = /(https?:\/\/)?(chat\.whatsapp\.com\/[A-Za-z0-9]+)/i
const WA_CHANNEL_REGEX = /(https?:\/\/)?(whatsapp\.com\/channel\/[A-Za-z0-9]+)/i

module.exports = {
  command: ["antilink"],
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,

  run: async (client, m, args) => {
    const option = args[0]?.toLowerCase()
    const groupId = m.chat

    if (!option || !["on", "off"].includes(option)) {
      return m.reply(
        "🔒 *ANTILINK*\n\n" +
        "Uso:\n" +
        "• `.antilink on`\n" +
        "• `.antilink off`"
      )
    }

    if (option === "on") {
      antilinkDB.add(groupId)
      return m.reply("✅ Antilink activado\nNo se permiten links de WhatsApp.")
    }

    if (option === "off") {
      antilinkDB.delete(groupId)
      return m.reply("❌ Antilink desactivado")
    }
  },

  // 👉 se ejecuta automáticamente en cada mensaje
  async before(client, m) {
    if (!m.isGroup) return
    if (!antilinkDB.has(m.chat)) return
    if (!m.message) return

    const body =
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      m.message.imageMessage?.caption ||
      m.message.videoMessage?.caption ||
      ""

    if (!body) return

    // Ignorar admins
    const sender = m.sender
    const metadata = await client.groupMetadata(m.chat).catch(() => null)
    if (!metadata) return

    const admins = metadata.participants
      .filter(p => p.admin)
      .map(p => p.id)

    if (admins.includes(sender)) return

    // Detectar links
    if (WA_LINK_REGEX.test(body) || WA_CHANNEL_REGEX.test(body)) {
      await client.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: m.key.id,
          participant: m.sender,
        }
      })

      await client.sendMessage(m.chat, {
        text: "🚫 *Links de WhatsApp no permitidos en este grupo*"
      })

      // 🔥 OPCIONAL: expulsar
      // await client.groupParticipantsUpdate(m.chat, [m.sender], "remove")
    }
  }
}
