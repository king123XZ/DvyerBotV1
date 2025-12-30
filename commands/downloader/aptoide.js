const axios = require("axios")

const API_URL = "https://api-sky.ultraplus.click/aptoide"
const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45"

// 🧠 Cache global
global.apkCache = global.apkCache || {}

module.exports = {
  command: ["apk", "apkdl1", "apkdl2"],
  run: async (client, m, args) => {

    const text = args.join(" ")
    const cmd = m.command

    // 🔍 BUSCAR
    if (cmd === "apk") {
      if (!text) return m.reply("❌ Usa: .apk <nombre>")

      if (!global.apkCache[text]) {
        const { data } = await axios.post(
          API_URL,
          { query: text },
          { headers: { apikey: API_KEY } }
        )

        if (!data.status || !data.result.results.length)
          return m.reply("❌ No se encontraron resultados.")

        // 🔒 TRUSTED + ⭐ ordenar
        global.apkCache[text] = data.result.results
          .filter(a => a.malware === "TRUSTED")
          .sort((a, b) => (b.rating + b.downloads) - (a.rating + a.downloads))
      }

      const apps = global.apkCache[text].slice(0, 5)

      const sections = apps.map((app, i) => ({
        title: `${i + 1}. ${app.name}`,
        rows: [
          {
            title: "📄 Ver información",
            description: "Datos + enlace",
            rowId: `.apkdl1 ${i + 1}`
          },
          {
            title: "📥 Descargar APK",
            description: "Enviar como documento",
            rowId: `.apkdl2 ${i + 1}`
          }
        ]
      }))

      return client.sendMessage(m.chat, {
        text: `🎠 *Resultados Aptoide*\n\n🔍 *${text}*`,
        footer: "SkyUltraPlus • APK Downloader",
        buttonText: "Seleccionar app",
        sections
      }, { quoted: m })
    }

    // 📄 INFO
    if (cmd === "apkdl1") {
      const index = parseInt(text) - 1
      const apps = Object.values(global.apkCache).flat()
      const app = apps[index]

      if (!app) return m.reply("❌ App no válida.")

      return m.reply(`
📱 *${app.name}*
👨‍💻 Developer: ${app.developer}
📦 Package: ${app.package}
🔢 Versión: ${app.version}
⭐ Rating: ${app.rating}
⬇️ Descargas: ${app.downloads.toLocaleString()}
📏 Tamaño: ${(app.size / 1024 / 1024).toFixed(2)} MB
🛡 Malware: ${app.malware}

🔗 APK:
${app.apk}
      `.trim())
    }

    // 📥 DESCARGA
    if (cmd === "apkdl2") {
      const index = parseInt(text) - 1
      const apps = Object.values(global.apkCache).flat()
      const app = apps[index]

      if (!app) return m.reply("❌ App no válida.")

      await m.reply("⏳ Descargando APK...")

      return client.sendMessage(m.chat, {
        document: { url: app.apk },
        mimetype: "application/vnd.android.package-archive",
        fileName: `${app.uname || app.name}.apk`,
        caption: `📦 ${app.name}\n⭐ ${app.rating}`
      }, { quoted: m })
    }
  }
}
