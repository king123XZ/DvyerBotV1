const { ytdl } = require("../../lib/ytdl")

module.exports = {
  command: ["yt", "ytdl"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      if (!args[0] || !args[1]) {
        return m.reply(
          "❌ Uso correcto:\n\n" +
          "!yt <link> mp3\n" +
          "!yt <link> 360\n\n" +
          "Ejemplo:\n" +
          "!yt https://youtu.be/ykN9-USzrdU mp3"
        )
      }

      await m.reply("⏳ Descargando, espera un momento...")

      const res = await ytdl(args[0], args[1].toLowerCase())

      if (res.error) return m.reply("❌ " + res.error)

      // 🔥 ENVÍA COMO DOCUMENTO (NO FALLA EN WA)
      await client.sendMessage(m.chat, {
        document: { url: res.link },
        fileName: `${res.title}.${args[1]}`,
        mimetype: args[1] === "mp3" ? "audio/mpeg" : "video/mp4"
      }, { quoted: m })

    } catch (e) {
      console.error(e)
      m.reply("❌ Error inesperado")
    }
  }
}
