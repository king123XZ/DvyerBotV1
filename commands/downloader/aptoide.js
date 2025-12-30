const axios = require("axios")

const API_URL = "https://api-sky.ultraplus.click/aptoide"
const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45"

// 🧠 Cache global
global.apkCache = global.apkCache || []

module.exports = {
  command: ["apk", "apkdl1"],
  run: async (client, m, args) => {

    const text = args.join(" ")
    const cmd = m.command

    // 🔍 BUSCAR APPS
    if (cmd === "apk") {
      if (!text) return m.reply("❌ Usa: .apk <nombre de la app>")

      const { data } = await axios.post(
        API_URL,
        { query: text },
        { headers: { apikey: API_KEY } }
      )

      if (!data.status || !data.result.results.length)
        return m.reply("❌ No se encontraron resultados.")

      // 🔒 Filtrar TRUSTED + ordenar
      const apps = data.result.results
        .filter(a => a.malware === "TRUSTED")
        .sort((a, b) => (b.downloads + b.rating) - (a.downloads + a.rating))
        .slice(0, 5)

      global.apkCache = apps

      let msg = `📦 *Resultados para:* ${text}\n\n`

      apps.forEach((app, i) => {
        msg += `*${i + 1}.* ${app.name}\n`
        msg += `⭐ Rating: ${app.rating}\n`
        msg += `⬇️ Descargas: ${app.downloads.toLocaleString()}\n`
        msg += `📏 ${(app.size / 1024 / 1024).toFixed(2)} MB\n`
        msg += `🧩 ${app.package}\n\n`
      })

      msg += `📥 Para descargar:\n👉 *.apkdl1 número*\nEjemplo: *.apkdl1 1*`

      // Enviar texto
      await m.reply(msg)

      // Enviar imágenes (una por app)
      for (const app of apps) {
        await client.sendMessage(
          m.chat,
          { image: { url: app.icon }, caption: `📱 ${app.name}` },
          { quoted: m }
        )
      }
    }

    // 📥 DESCARGAR APK
    if (cmd === "apkdl1") {
      const index = parseInt(text) - 1
      const app = global.apkCache[index]

      if (!app) return m.reply("❌ Número de app inválido.")

      await m.reply("⏳ Descargando APK...")

      return client.sendMessage(
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
}
