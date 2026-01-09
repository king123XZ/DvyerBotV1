const axios = require("axios")
const { addQueue, runQueue } = require("../../lib/system/userQueue")


// ADONIX
const ADONIX_API = "https://api-adonix.ultraplus.click/download/ytvideo"
const ADONIX_KEY = "dvyer"

// SKY
const SKY_REGISTER = "https://api-sky.ultraplus.click/youtube-mp4"
const SKY_RESOLVE = "https://api-sky.ultraplus.click/youtube-mp4/resolve"
const SKY_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45"

module.exports = {
  command: ["ytvideo"],
  category: "downloader",

  run: async (client, m, args) => {
    const url = args[0]
    if (!url || !url.startsWith("http")) {
      return m.reply("❌ Enlace de YouTube inválido.")
    }

    enqueue(m.sender, async () => {
      let sent = false

      try {
        // ⏳ aviso rápido
        await m.reply("⏳ Descargando video...")

        // ========= SKY =========
        if (global.hosting === "sky") {
          await axios.post(
            SKY_REGISTER,
            { url },
            { headers: { apikey: SKY_KEY } }
          )

          const res = await axios.post(
            SKY_RESOLVE,
            { url, type: "video", quality: "360" },
            { headers: { apikey: SKY_KEY }, timeout: 60000 }
          )

          const videoUrl = res.data?.result?.media?.direct
          const title = res.data?.result?.title || "video"

          if (!videoUrl) throw new Error("Sky sin link")

          await client.sendMessage(
            m.chat,
            {
              video: { url: videoUrl },
              mimetype: "video/mp4",
              fileName: `${title}.mp4`
            },
            { quoted: m }
          )

          sent = true
        }

        // ========= ADONIX =========
        if (!sent) {
          const res = await axios.get(
            `${ADONIX_API}?url=${encodeURIComponent(url)}&apikey=${ADONIX_KEY}`,
            { timeout: 60000 }
          )

          const videoUrl = res.data?.data?.url
          const title = res.data?.data?.title || "video"

          if (!videoUrl) throw new Error("Adonix sin link")

          await client.sendMessage(
            m.chat,
            {
              video: { url: videoUrl },
              mimetype: "video/mp4",
              fileName: `${title}.mp4`
            },
            { quoted: m }
          )
        }

      } catch (err) {
        console.error("YTVIDEO ERROR:", err.message)
        await m.reply("❌ No se pudo descargar el video.")
      }
    })

    process(m.sender)
  }
}

