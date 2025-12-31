const axios = require("axios")

const API_KEY = "may-3697c22b"
const API_URL = "https://api.soymaycol.icu/ytdl"

module.exports = {
  command: ["ytmp3", "ytdl"],

  run: async (client, m, args) => {
    const url = args[0]

    if (!url)
      return m.reply("❌ Usa: *.ytmp3 <link de YouTube>*")

    if (!/youtube\.com|youtu\.be/.test(url))
      return m.reply("❌ Enlace de YouTube inválido")

    try {
      await m.reply("⏳ Descargando audio...")

      const { data } = await axios.get(API_URL, {
        params: {
          url,
          apikey: API_KEY
        },
        timeout: 20000
      })

      if (!data.status)
        return m.reply("❌ Error al procesar el video")

      const result = data.result

      await client.sendMessage(
        m.chat,
        {
          audio: { url: result.url },
          mimetype: "audio/mpeg",
          fileName: `${result.title}.mp3`,
          caption: `🎵 *${result.title}*\n🎧 Calidad: ${result.quality}`
        },
        { quoted: m }
      )

    } catch (err) {
      console.error(err)
      return m.reply("❌ Falló la descarga, intenta más tarde")
    }
  }
}
