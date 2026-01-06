const fs = require("fs")
const path = require("path")

const DB_DIR = path.join(__dirname, "../data")
const DB_FILE = path.join(DB_DIR, "antilink.json")

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true })
}

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ groups: {} }, null, 2))
}

const loadDB = () => JSON.parse(fs.readFileSync(DB_FILE))
const saveDB = data => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2))

const WA_LINK_REGEX =
  /(https?:\/\/)?(chat\.whatsapp\.com\/[A-Za-z0-9]+|whatsapp\.com\/channel\/[A-Za-z0-9]+)/i

async function antilink(client, m) {
  try {
    if (!m.isGroup) return

    const text =
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      m.message?.imageMessage?.caption ||
      m.message?.videoMessage?.caption ||
      ""

    if (!WA_LINK_REGEX.test(text)) return

    const db = loadDB()
    if (!db.groups[m.chat]) return

    await client.sendMessage(m.chat, { delete: m.key })

    await client.sendMessage(m.chat, {
      text: "🚫 *Enlace de WhatsApp eliminado*",
    })

  } catch (e) {
    console.log("ANTILINK ERROR:", e)
  }
}

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
