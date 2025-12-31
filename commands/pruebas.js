const axios = require("axios")

const API_URL = "https://api.soymaycol.icu/ytdl"
const API_KEY = "may-3697c22b"

module.exports = {
  command: ["ytmp3", "ytdl"],

  run: async (client, m, args) => {
    const url = args[0]
    if (!url)
      return m.reply("❌ Usa: *.ytmp3 <link de YouTube>*")

    if (!/youtu\.be|youtube\.com/.test(url))
      return m.reply("❌ Enlace de YouTube inválido")

    try {
      await m.reply("⏳ Procesando audio, espera unos segundos...")

      const { data } = await axios.get(API_URL, {
        params: {
          url,
          apikey: API_KEY
        },
        timeout: 60000 // ⬅️ 60 segundos
      })

      if (!data.status)
        return m.reply("❌ No se pudo procesar el video")

      const r = data.result
      const fileName = `${r.title}.mp3`

      await client.sendMessage(
        m.chat,
        {
          document: { url: r.url },
          mimetype: "audio/mpeg",
          fileName,
          caption:
`🎵 *${r.title}*
🎧 Calidad: ${r.quality}

📥 Enviado como documento`
        },
        { quoted: m }
      )

    } catch (err) {
      console.error(err)

      if (err.code === "ECONNABORTED") {
        return m.reply("⚠️ La API tardó demasiado, intenta otra vez.")
      }

      return m.reply("❌ Error al descargar el audio.")
    }
  }
}
