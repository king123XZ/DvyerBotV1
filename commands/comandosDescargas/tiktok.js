
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

      // ❌ Validación
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

      const data = res.data?.result;
      if (!data?.play) {
        throw new Error("Respuesta inválida de la API TikTok");
      }

      // 🧼 Limpiar título
      const title = (data.title || "tiktok")
        .replace(/[\\/:*?"<>|]/g, "")
        .slice(0, 60);

      // 🎥 Enviar video
      await client.sendMessage(
        m.chat,
        {
          video: { url: data.play }, // sin marca de agua
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
