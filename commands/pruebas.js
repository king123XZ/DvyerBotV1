const axios = require("axios")

module.exports = {
  command: ["ytmp3"],
  run: async (client, m, args) => {
    const url = args[0]

    if (!url)
      return m.reply("❌ Usa: *.ytmp3 <link de YouTube>*")

    if (!url.includes("youtu"))
      return m.reply("❌ Enlace de YouTube inválido")

    try {
      await m.reply("⏳ Convirtiendo a MP3...")

      const api = "https://api-sky.ultraplus.click/tools/yta"
      const { data } = await axios.post(api, { url })

      if (!data.status)
        return m.reply("❌ Error al convertir el audio")

      await client.sendMessage(
        m.chat,
        {
          document: { url: data.result.download },
          mimetype: "audio/mpeg",
          fileName: `${data.result.title}.mp3`,
          caption: `🎵 *${data.result.title}*\n🎧 Calidad: ${data.result.quality}`
        },
        { quoted: m }
      )

    } catch (err) {
      console.error(err)
      m.reply("❌ Falló la descarga")
    }
  }
}
