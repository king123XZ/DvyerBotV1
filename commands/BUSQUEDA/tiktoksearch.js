const axios = require("axios");

// GAWRGURA API
const SEARCH_API = "https://gawrgura-api.onrender.com/search/tiktok";

// BOT
const BOT_NAME = "KILLUA-BOT v1.00";

module.exports = {
  command: ["tiktok", "tt"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      const query = args.join(" ");

      if (!query) {
        return client.reply(
          m.chat,
          "❌ Escribe algo para buscar en TikTok.\nEjemplo:\n.tiktok goku",
          m,
          global.channelInfo
        );
      }

      // ⏳ UX
      await client.reply(
        m.chat,
        `🔎 *Buscando en TikTok...*\n` +
        `🎯 Descarga automática\n` +
        `🤖 ${BOT_NAME}`,
        m,
        global.channelInfo
      );

      // 📡 Buscar
      const res = await axios.get(
        `${SEARCH_API}?q=${encodeURIComponent(query)}`,
        { timeout: 60000 }
      );

      const results = res.data?.result;
      if (!Array.isArray(results) || results.length === 0) {
        return client.reply(
          m.chat,
          "❌ No se encontraron resultados.",
          m,
          global.channelInfo
        );
      }

      // 🎯 Primer resultado
      const video = results[0];

      const videoUrl = video.play; // sin marca de agua
      const title = (video.title || "tiktok")
        .replace(/[\\/:*?"<>|]/g, "")
        .slice(0, 60);

      // 🎥 Enviar video
      await client.sendMessage(
        m.chat,
        {
          video: { url: videoUrl },
          mimetype: "video/mp4",
          fileName: `${title}.mp4`
        },
        { quoted: m, ...global.channelInfo }
      );

    } catch (err) {
      console.error("TIKTOK AUTO ERROR:", err.response?.data || err.message);
      await client.reply(
        m.chat,
        "❌ Error al buscar o descargar el video de TikTok.",
        m,
        global.channelInfo
      );
    }
  }
};
