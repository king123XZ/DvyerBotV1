const api = require("../lib/api")
const queue = require("../lib/queue")

module.exports = {
  name: "yt",
  async run(client, m, args) {
    if (!args[0]) {
      return m.reply("❌ Ingresa un link de YouTube")
    }

    await m.reply("⏳ En cola de descarga...")

    await queue.add(async () => {
      const res = await api.post(
        "https://api-adonix.ultraplus.click/download/ytvideo",
        { url: args[0], quality: "360p" },
        { headers: { apikey: process.env.ADONIX_KEY } }
      )

      const videoUrl = res.data?.result?.url
      if (!videoUrl) throw new Error("Error descarga")

      await client.sendMessage(
        m.chat,
        { video: { url: videoUrl }, caption: "✅ Descarga completa" }
      )
    })
  }
}
