const axios = require("axios")

const API_URL = "https://api-sky.ultraplus.click/aptoide"
const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45"

// Cache temporal
global.apkButtonCache = global.apkButtonCache || {}

module.exports = {
  command: ["apk"],
  run: async (client, m, args) => {
    const text = args.join(" ")
    if (!text) return m.reply("❌ Usa: .apk <nombre de la app>")

    const { data } = await axios.post(
      API_URL,
      { query: text },
      { headers: { apikey: API_KEY } }
    )

    if (!data.status || !data.result.results.length)
      return m.reply("❌ No se encontraron resultados.")

    // Filtrar TRUSTED y tomar solo 3
    const apps = data.result.results
      .filter(a => a.malware === "TRUSTED")
      .slice(0, 3)

    // Guardar cache por usuario
    global.apkButtonCache[m.sender] = apps

    for (let i = 0; i < apps.length; i++) {
      const app = apps[i]

      const caption = `
📱 *${app.name}*
👨‍💻 ${app.developer}
⭐ Rating: ${app.rating}
⬇️ Descargas: ${app.downloads.toLocaleString()}
📏 ${(app.size / 1024 / 1024).toFixed(2)} MB
      `.trim()

      await client.sendMessage(
        m.chat,
        {
          image: { url: app.icon },
          caption,
          buttons: [
            {
              buttonId: `apk_download_${i}`,
              buttonText: { displayText: "📥 DESCARGAR APK" },
              type: 1
            }
          ],
          footer: "APK Downloader •killua bot V1.000",
          headerType: 4
        },
        { quoted: m }
      )
    }
  },

  // 📥 MANEJO DEL BOTÓN
  onButton: async (client, m) => {
    if (!m.buttonId) return
    if (!m.buttonId.startsWith("apk_download_")) return

    const index = parseInt(m.buttonId.split("_")[2])
    const user = m.sender

    // 🔒 Seguridad: solo el que pidió
    if (!global.apkButtonCache[user])
      return m.reply("❌ Este botón no es para ti.")

    const app = global.apkButtonCache[user][index]
    if (!app) return m.reply("❌ App no válida.")

    await m.reply("⏳ Descargando APK...")

    await client.sendMessage(
      m.chat,
      {
        document: { url: app.apk },
        mimetype: "application/vnd.android.package-archive",
        fileName: `${app.uname || app.name}.apk`,
        caption: `📦 ${app.name}\n⭐ ${app.rating}`
      },
      { quoted: m }
    )
  }
}
