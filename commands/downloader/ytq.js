const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
const API_URL = "https://api-sky.ultraplus.click/youtube-mp4/resolve";

// calidades permitidas por la API
const ALLOWED_QUALITIES = ["144", "240", "360", "480", "720", "1080"];

module.exports = {
  command: ["ytq"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      const quality = args[0];

      // 📦 cache global seguro
      const cache = global.ytCache?.[m.sender];

      if (!cache) {
        return; // no responde → evita spam
      }

      // 🚫 si no es el que pidió, no hace nada
      if (cache.owner !== m.sender) {
        return;
      }

      if (!ALLOWED_QUALITIES.includes(quality)) {
        return m.reply("❌ Calidad no válida.");
      }

      await m.reply(`⬇️ Descargando video ${quality}p...`);

      const { data } = await axios.post(
        API_URL,
        {
          url: cache.url,
          type: "video",
          quality
        },
        {
          headers: {
            "Content-Type": "application/json",
            apikey: API_KEY
          },
          timeout: 15000
        }
      );

      if (!data?.status) {
        return m.reply("❌ Esa calidad no está disponible.");
      }

      const videoUrl = data?.result?.media?.direct;
      if (!videoUrl) {
        return m.reply("❌ No se pudo obtener el video.");
      }

      // 🎥 ENVÍO POR STREAM (sin guardar archivos)
      await client.sendMessage(
        m.chat,
        {
          video: { url: videoUrl },
          mimetype: "video/mp4",
          caption: `🎬 *${data.result.title}*\n📺 Calidad: ${quality}p`
        },
        { quoted: m }
      );

      // 🧹 limpiar cache
      delete global.ytCache[m.sender];

    } catch (err) {
      console.error("YTQ ERROR:", err.response?.data || err.message);
      delete global.ytCache[m.sender];
      m.reply("❌ Error al procesar el video.");
    }
  }
};
