const axios = require("axios");

// GAWRGURA DOWNLOAD API
const DOWNLOAD_API = "https://gawrgura-api.onrender.com/download/tiktok";

// BOT
const BOT_NAME = "KILLUA-BOT v1.00";

module.exports = {
  command: ["tiktok", "tt"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      const url = args[0];

      // ❌ Validar enlace
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
        `${DOWNLOAD_API}?url=${encodeURIComponent(url)}`,
        { timeout: 120000 }
      );

      // ✅ ESTRUCTURA REAL
      const data = res.data?.data;
      if (!Array.isArray(data) || !data[0]?.url) {
        console.error("API RESPONSE:", res.data);
        throw new Error("Formato inválido de la API TikTok");
      }

      const videoUrl = data[0].url;

      // 🎥 Enviar video
      await client.sendMessage(
        m.chat,
        {
          video: { url: videoUrl },
          mimetype: "video/mp4",
          fileName: "tiktok.mp4"
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

