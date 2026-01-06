const fs = require("fs")
const path = require("path")

// ===== RUTAS =====
const DB_DIR = path.join(__dirname, "../data")
const DB_FILE = path.join(DB_DIR, "antilink.json")

// ===== CREAR CARPETA Y ARCHIVO SI NO EXISTEN =====
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({ groups: {} }, null, 2))

// ===== FUNCIONES DB =====
const loadDB = () => {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8"))
  } catch (e) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ groups: {} }, null, 2))
    return { groups: {} }
  }
}

const saveDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2))

// ===== REGEX LINKS WHATSAPP =====
const WA_LINK_REGEX = /(https?:\/\/)?(chat\.whatsapp\.com\/[A-Za-z0-9]+|whatsapp\.com\/channel\/[A-Za-z0-9]+)/i

// ===== EJECUTAR ANTI-LINK =====
module.exports.execute = async (client, m) => {
  try {
    if (!m.isGroup) return

    const text =
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      m.message?.imageMessage?.caption ||
      m.message?.videoMessage?.caption ||
      ""

    if (!WA_LINK_REGEX.test(text)) return

    // borrar mensaje
    await client.sendMessage(m.chat, { delete: m.key }).catch(() => {})

    // enviar aviso
    await client.sendMessage(m.chat, {
      text: "🚫 *Enlace de WhatsApp eliminado*\nNo está permitido enviar grupos o canales."
    }).catch(() => {})

  } catch (e) {
    console.log("ANTILINK ERROR:", e)
  }
}

// ===== ACTIVAR / DESACTIVAR ANTI-LINK =====
module.exports.isActive = (chat) => {
  const db = loadDB()
  return Boolean(db.groups[chat])
}

module.exports.setActive = (chat, state) => {
  const db = loadDB()
  if (state) db.groups[chat] = true
  else delete db.groups[chat]
  saveDB(db)
}
