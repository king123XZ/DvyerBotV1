const axios = require("axios")
const getQueue = require("../../lib/system/userQueue")

// ================= API CONFIG =================

// Adonix
const ADONIX_API = "https://api-adonix.ultraplus.click/download/ytvideo"
const ADONIX_KEY = "dvyer"

// Sky
const SKY_API_REGISTER = "https://api-sky.ultraplus.click/youtube-mp4"
const SKY_API_RESOLVE = "https://api-sky.ultraplus.click/youtube-mp4/resolve"
const SKY_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45"

// Bot
const BOT_NAME = "KILLUA-BOT v1.00"
const SKY_QUALITIES = ["720", "360"]

// =================================================

module.exports = {
  command: ["ytvideo"],
  category: "downloader",

  run: async (client, m, args) => {
    const url = args[0]
    if (!url || !url.startsWith("http")) {
      return m.reply("❌ Enlace de YouTube no válido.")
    }

    const queue = getQueue(m.sender)

    await queue.add(async () => {
      const hosting = global.hosting || "adonix"
      global.ytCache = global.ytCache || {}

      let videoUrl, title = "video", finalQuality = ""

      try {
        // ======================
        // SKY (CON BOTONES)
        // ======================
        if (hosting === "sky") {
          let quality = args[1]

          if (!quality) {
            global.ytCache[m.sender] = { url }

            const buttons = SKY_QUALITIES.map(q => ({
              buttonId: `.ytvideo ${url} ${q}`,
              buttonText: { displayText: `🎬 ${q}p` },
              type: 1
            }))

            return client.sendMessage(
              m.chat,
              {
                text: "📥 *Selecciona la calidad del video:*",
                footer: `🤖 ${BOT_NAME} • API SKY`,
                buttons,
                headerType: 1
              },
              { quoted: m }
            )
          }

          quality = SKY_QUALITIES.includes(quality) ? quality : "720"
          finalQuality = `${quality}p`

          await m.reply(
            `⏳ *Descargando video...*\n📺 Calidad: ${finalQuality}\n✅ API: SKY`
          )

          const cache = global.ytCache[m.sender] || { url }

          await axios.post(
            SKY_API_REGISTER,
            { url: cache.url },
            { headers: { apikey: SKY_KEY } }
          )

          const res = await axios.post(
            SKY_API_RESOLVE,
            { url: cache.url, type: "video", quality },
            { headers: { apikey: SKY_KEY }, timeout: 60000 }
          )

          videoUrl = res.data?.result?.media?.direct
          title = res.data?.result?.title || title

          delete global.ytCache[m.sender]
        }

        // ======================
        // ADONIX (AUTOMÁTICO)
        // ======================
        else {
          await m.reply(
            `⏳ *Descargando video...*\n✅ API: ADONIX`
          )

          const res = await axios.get(
            `${ADONIX_API}?url=${encodeURIComponent(url)}&apikey=${ADONIX_KEY}`,
            { timeout: 60000 }
          )

          if (!res.data?.status || !res.data?.data?.url) {
            throw new Error("Respuesta inválida de Adonix")
          }

          videoUrl = res.data.data.url
          title = res.data.data.title || title
          finalQuality = res.data.data.quality || "360p"
        }

        if (!videoUrl) throw new Error("No se obtuvo el enlace del video")

        // Limpiar título
        title = title.replace(/[\\/:*?"<>|]/g, "").slice(0, 60)

        // ======================
        // STREAMING REAL
        // ======================
        const stream = await axios({
          url: videoUrl,
          method: "GET",
          responseType: "stream",
          timeout: 0
        })

        await client.sendMessage(
          m.chat,
          {
            video: stream.data,
            mimetype: "video/mp4",
            fileName: `${title}.mp4`
          },
          { quoted: m }
        )

      } catch (err) {
        console.error("YTVIDEO ERROR:", err.response?.data || err.message)
        m.reply("❌ Error al descargar el video.")
      }
    })
  }
}
