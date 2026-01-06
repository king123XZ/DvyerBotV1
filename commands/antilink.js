// commands/antilink.js

const WA_GROUP = /chat\.whatsapp\.com\/[A-Za-z0-9]+/i
const WA_CHANNEL = /whatsapp\.com\/channel\/[A-Za-z0-9]+/i

// grupos con antilink activo
const antilinkGroups = new Set()

module.exports = async function antilink(client, m) {
  if (!m.isGroup) return
  if (!m.message) return

  const text =
    m.message.conversation ||
    m.message.extendedTextMessage?.text ||
    m.message.imageMessage?.caption ||
    m.message.videoMessage?.caption ||
    ""

  if (!text) return

  // ⛔ solo links de WhatsApp
  if (!WA_GROUP.test(text) && !WA_CHANNEL.test(text)) return

  // metadata
  const meta = await client.groupMetadata(m.chat).catch(() => null)
  if (!meta) return

  const admins = meta.participants
    .filter(p => p.admin)
    .map(p => p.jid)

  // admin no se borra
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
    text: "🚫 Enlaces de grupos o canales de WhatsApp no permitidos"
  })
}

/* ===== COMANDO ON / OFF ===== */
module.exports.command = ["antilink"]
module.exports.isGroup = true
module.exports.isAdmin = true
module.exports.isBotAdmin = true

module.exports.run = async (client, m, args) => {
  const opt = args[0]?.toLowerCase()
  if (!opt || !["on", "off"].includes(opt)) {
    return m.reply("Uso:\n.antilink on\n.antilink off")
  }

  if (opt === "on") {
    antilinkGroups.add(m.chat)
    return m.reply("✅ Antilink activado")
  }

  if (opt === "off") {
    antilinkGroups.delete(m.chat)
    return m.reply("❌ Antilink desactivado")
  }
}

// control interno
module.exports.isActive = chat => antilinkGroups.has(chat)
