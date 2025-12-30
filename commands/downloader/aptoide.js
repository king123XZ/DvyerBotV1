import axios from "axios"

const API_URL = "https://api-sky.ultraplus.click/aptoide"
const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45"

// 🧠 Cache en memoria
global.apkCache = global.apkCache || {}

const handler = async (m, { conn, text, command }) => {

  // 🔍 BUSCAR APPS
  if (command === "apk") {
    if (!text) return m.reply("❌ Usa: .apk <nombre>")

    if (!global.apkCache[text]) {
      const { data } = await axios.post(
        API_URL,
        { query: text },
        { headers: { apikey: API_KEY } }
      )

      if (!data.status || !data.result.results.length)
        return m.reply("❌ No se encontraron resultados.")

      // 🔒 Filtro TRUSTED + ⭐ ordenar
      const apps = data.result.results
        .filter(a => a.malware === "TRUSTED")
        .sort((a, b) => (b.rating + b.downloads) - (a.rating + a.downloads))

      global.apkCache[text] = apps
    }

    const apps = global.apkCache[text].slice(0, 5)

    let sections = apps.map((app, i) => ({
      title: `${i + 1}. ${app.name}`,
      rows: [
        {
          title: "📄 Ver información",
          description: "Datos + enlace (NO descarga)",
          rowId: `.apkdl1 ${i + 1}`
        },
        {
          title: "📥 Descargar APK",
          description: "Enviar como documento",
          rowId: `.apkdl2 ${i + 1}`
        }
      ]
    }))

    await conn.sendMessage(m.chat, {
      text: `🎠 *Resultados Aptoide*\n\n🔍 Búsqueda: *${text}*`,
      footer: "SkyUltraPlus • APK Downloader",
      buttonText: "Selecciona una app",
      sections
    }, { quoted: m })
  }

  // 📄 SOLO INFO + LINK
  if (command === "apkdl1") {
    const index = parseInt(text) - 1
    const apps = Object.values(global.apkCache).flat()
    const app = apps[index]

    if (!app) return m.reply("❌ App no válida.")

    let info = `
📱 *${app.name}*
👨‍💻 Developer: ${app.developer}
📦 Package: ${app.package}
🔢 Versión: ${app.version}
⭐ Rating: ${app.rating}
⬇️ Descargas: ${app.downloads.toLocaleString()}
🛡 Malware: ${app.malware}
📏 Tamaño: ${(app.size / 1024 / 1024).toFixed(2)} MB

🔗 *Enlace APK:*
${app.apk}
    `.trim()

    return m.reply(info)
  }

  // 📥 DESCARGAR APK
  if (command === "apkdl2") {
    const index = parseInt(text) - 1
    const apps = Object.values(global.apkCache).flat()
    const app = apps[index]

    if (!app) return m.reply("❌ App no válida.")

    await m.reply("⏳ Descargando APK...")

    await conn.sendMessage(m.chat, {
      document: { url: app.apk },
      fileName: `${app.uname || app.name}.apk`,
      mimetype: "application/vnd.android.package-archive",
      caption: `📦 ${app.name}\n⭐ ${app.rating} | ⬇️ ${app.downloads.toLocaleString()}`
    }, { quoted: m })
  }
}

handler.command = ["apk", "apkdl1", "apkdl2"]
export default handler
