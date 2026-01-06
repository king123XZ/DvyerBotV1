const fs = require("fs")
const path = require("path")

const DB_DIR = path.join(__dirname, "../data")
const DB_FILE = path.join(DB_DIR, "antilink.json")

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })
if (!fs.existsSync(DB_FILE))
  fs.writeFileSync(DB_FILE, JSON.stringify({ groups: {} }, null, 2))

const loadDB = () => {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE))
  } catch {
    return { groups: {} }
  }
}

const saveDB = data =>
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2))

// 🔥 LINKS DE WHATSAPP (GRUPOS + CANALES)
const WA_LINK =
  /(chat\.whatsapp\.com\/[A-Za-z0-9]+|whatsapp\.com\/channel\/[A-Za-z0-9]+)/i

async function antilink(client, m) {
  try {
    if (!m.isGroup) return

    const text =
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
      m.message?.imageMessage?.caption ||
      m.message?.videoMessage?.caption ||
      ""

    if (!WA_LINK.test(text)) return

    const db = loadDB()
    if (!db.groups[m.chat]) return

    const sender = m.sender || m.key.participant
    const botJid = client.user.id.split(":")[0] + "@s.whatsapp.net"

    const meta = await client.groupMetadata(m.chat)
    const admins = meta.participants.filter(p => p.admin).map(p => p.id)

    const isBotAdmin = admins.includes(botJid)
    const isSenderAdmin = admins.includes(sender)

    if (!isBotAdmin) return
    if (isSenderAdmin) return // no castigar admins

    // 🧹 BORRAR MENSAJE
    await client.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: m.key.id,
        participant: sender,
      },
    })

    // ⛔ EXPULSAR
    await client.groupParticipantsUpdate(m.chat, [sender], "remove")

    // 📢 AVISO
    await client.sendMessage(m.chat, {
      text: "🚫 *Enlace de WhatsApp detectado*\nUsuario eliminado automáticamente.",
    })

  } catch (e) {
    console.log("ANTILINK ERROR:", e)
  }
}

// ===== CONTROL =====
antilink.isActive = chat => {
  const db = loadDB()
  return Boolean(db.groups[chat])
}

antilink.setActive = (chat, state) => {
  const db = loadDB()
  if (state) db.groups[chat] = true
  else delete db.groups[chat]
  saveDB(db)
}

module.exports = antilink

