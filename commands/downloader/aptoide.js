const axios = require("axios")

const API_URL = "https://api-sky.ultraplus.click/aptoide"
const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45"

global.apkUserCache = global.apkUserCache || {}

module.exports = {
  command: ["apk", "apkget", "apknext"],
  run: async (client, m, args) => {
    const cmd = m.command
    const sender = m.sender

    if (cmd === "apk") {
      const query = args.join(" ")
      if (!query) return m.reply("❌ Usa: .apk <nombre>")

      const { data } = await axios.post(
        API_URL,
        { query },
        { headers: { apikey: API_KEY } }
      )

      const results = data?.result?.results
        ?.filter(a => a.malware === "TRUSTED")
        ?.slice(0, 3)

      if (!results || !results.length)
        return m.reply("❌ No se encontraron apps seguras.")

      global.apkUserCache[sender] = {
        index: 0,
        apps: results,
        time: Date.now()
      }

      return sendApp(client, m, sender)
    }

    
    if (cmd === "apkget") {
      const cache = global.apkUserCache[sender]
      if (!cache) return m.reply("❌ No tienes una búsqueda activa.")

      const app = cache.apps[cache.index]
      if (!app) return m.reply("❌ App no válida.")

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

    if (cmd === "apknext") {
      const cache = global.apkUserCache[sender]
      if (!cache) return m.reply("❌ No tienes una búsqueda activa.")

      if (Date.now() - cache.time < 5000)
        return m.reply("⏱ Espera 5 segundos para ver la siguiente app.")

      cache.index++
      cache.time = Date.now()

      if (!cache.apps[cache.index])
        return m.reply("❌ No hay más resultados.")

      return sendApp(client, m, sender)
    }
  }
}

async function sendApp(client, m, sender) {
  const cache = global.apkUserCache[sender]
  const app = cache.apps[cache.index]

  const caption = `
📱 *${app.name}*
👨‍💻 ${app.developer}
⭐ Rating: ${app.rating}
⬇️ Descargas: ${app.downloads.toLocaleString()}
📏 ${(app.size / 1024 / 1024).toFixed(2)} MB
  `.trim()

  return client.sendMessage(
    m.chat,
    {
      image: { url: app.icon },
      caption,
      footer: "APK Downloader • Killua Bot V1.000",
      buttons: [
        {
          buttonId: ".apkget",
          buttonText: { displayText: "📥 DESCARGAR APK" },
          type: 1
        },
        {
          buttonId: ".apknext",
          buttonText: { displayText: "➡️ SIGUIENTE APP" },
          type: 1
        }
      ],
      headerType: 4
    },
    { quoted: m }
  )
}

