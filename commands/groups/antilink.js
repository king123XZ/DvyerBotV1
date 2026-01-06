// commands/antilink.js

const WA_GROUP = /chat\.whatsapp\.com\/[A-Za-z0-9]+/i
const WA_CHANNEL = /whatsapp\.com\/channel\/[A-Za-z0-9]+/i

const antilinkGroups = new Set()

module.exports = {
  // activar / desactivar
  command: ["antilink"],
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,

  run: async (client, m, args) => {
    const opt = args[0]?.toLowerCase()
    if (!opt || !["on", "off"].includes(opt)) {
      return m.reply("Uso:\n.antilink on\n.antilink off")
    }

    if (opt === "on") {
      antilinkGroups.add(m.chat)
      return m.reply("✅ AntILink activado")
    }

    if (opt === "off") {
      antilinkGroups.delete(m.chat)
      return m.reply("❌ AntILink desactivado")
    }
  },

  // ⚠️ ESTO ES LO IMPORTANTE
  check: async (client, m) => {
    if (!m.isGroup) return
    if (!antilinkGroups.has(m.chat)) return
    if (!m.message) return

    const text =
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      m.message.imageMessage?.caption ||
      m.message.videoMessage?.caption ||
      ""

    if (!text) return
    if (!WA_GROUP.test(text) && !WA_CHANNEL.test(text)) return

    // Obtener admins
    const meta = await client.groupMetadata(m.chat).catch(() => null)
    if (!meta) return

    const admins = meta.participants
      .filter(p => p.admin)
      .map(p => p.id)

    if (admins.includes(m.sender)) return

    // 🧹 borrar mensaje
    await client.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: m.key.id,
        participant: m.sender
      }
    })

    await client.sendMessage(m.chat, {
      text: "🚫 Links de WhatsApp no permitidos"
    })
  }
}
