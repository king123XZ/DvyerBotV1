const fetch = require("node-fetch")
const yts = require("yt-search")

module.exports = {
  command: ["play"],
  description: "Descarga audio de YouTube en MP3.",
  category: "downloader",
  use: "!play nombre de la canción",
  run: async (client, m, args) => {
    if (!args[0]) {
      return m.reply(
`> ⓘ Debes escribir el nombre de la canción

Ejemplos:
• !play corridos tumbados
• !play arcangel la oficial`
      )
    }

    const text = args.join(" ")

    try {
      await m.reply(mess.wait)

      const search = await yts(text)
      if (!search.videos.length) return m.reply("> No encontré resultados.")

      const video = search.videos[0]
      const { title, url, thumbnail } = video

      let thumbBuffer = null
      try {
        const resp = await fetch(thumbnail)
        thumbBuffer = Buffer.from(await resp.arrayBuffer())
      } catch (e) {
        console.log("No thumb:", e.message)
      }

      const fuentes = [
        {
          api: "Adonix",
          endpoint: `https://api-adonix.ultraplus.click/download/ytaudio?apikey=${global.apikey}&url=${encodeURIComponent(url)}`,
          extractor: (res) => res?.data?.url
        },
        {
          api: "MayAPI",
          endpoint: `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(url)}&type=mp3&apikey=${global.APIKeys['https://mayapi.ooguy.com']}`,
          extractor: (res) => res.result.url
        }
      ]

      let audioUrl = null

      for (let fuente of fuentes) {
        try {
          const response = await fetch(fuente.endpoint)
          if (!response.ok) continue
          const data = await response.json()
          const link = fuente.extractor(data)
          if (link) {
            audioUrl = link
            break
          }
        } catch {}
      }

      if (!audioUrl) {
        return m.reply("> ❌ No se pudo obtener el audio, APIs caídas.")
      }

      await client.sendMessage(
        m.chat,
        {
          audio: { url: audioUrl },
          mimetype: "audio/mpeg",
          jpegThumbnail: thumbBuffer,
          fileName: "audio.mp3",
          ptt: false
        },
        { quoted: m }
      )
    } catch (e) {
      console.log(e)
      m.reply("> Error: " + e.message)
    }
  },
}


