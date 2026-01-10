const axios = require("axios");

// GAWRGURA API (search funciona también con link)
const API_URL = "https://gawrgura-api.onrender.com/search/tiktok";

// BOT
const BOT_NAME = "KILLUA-BOT v1.00";

module.exports = {
  command: ["tiktok", "tt"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      const url = args[0];

      // ❌ validar enlace
      if (!url || !/tiktok\.com/.test(url)) {
        return client.reply(
          m.chat,
          "❌ Enlace de TikTok no válido.\nEjemplo:\n" +
          ".tiktok https://www.tiktok.com/@user/video/123",
          m,
          global.channelInfo
        );
      }

      // ⏳ UX
      await client.reply(
        m.chat,
        `⏳ *Descargando TikTok...*\n🤖 ${BOT_NAME}`,
        m,
        global.channelInfo
      );

      // 📡 API
      const res = await axios.get(
        `${API_URL}?q=${encodeURIComponent(url)}`,
        { timeout: 60000 }
      );

      const list = res.data?.result;
      if (!Array.isArray(list) || !list[0]?.play) {
        console.error("API RESPONSE:", res.data);
        throw new Error("Respuesta inválida de TikTok API");
      }

      const video = list[0];

      // 🧼 limpiar título
      const title = (video.title || "tiktok")
        .replace(/[\\/:*?"<>|]/g, "")
        .slice(0, 60);

      // 🎥 enviar video
      await client.sendMessage(
        m.chat,
        {
          video: { url: video.play }, // SIN marca
          mimetype: "video/mp4",
          fileName: `${title}.mp4`
        },
        { quoted: m, ...global.channelInfo }
      );

    } catch (err) {
      console.error("TIKTOK DOWNLOAD ERROR:", err.response?.data || err.message);
      await client.reply(
        m.chat,
        "❌ Error al descargar el video de TikTok.",
        m,
        global.channelInfo
      );
    }
  }
};


