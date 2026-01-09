

const axios = require("axios");

const API_URL = "https://api-adonix.ultraplus.click/download/tiktok";
const API_KEY = "dvyer";

module.exports = {
  command: ["tiktok", "tt"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      const url = args[0];

      if (!url || !url.startsWith("http")) {
        return client.reply(
          m.chat,
          "📌 Usa:\n.tiktok https://www.tiktok.com/@user/video/123",
          m,
          global.channelInfo
        );
      }

      // ⚡ Aviso rápido
      await client.reply(
        m.chat,
        "⏳ Descargando video...",
        m,
        global.channelInfo
      );

      // ✅ GET correcto
      const res = await axios.get(API_URL, {
        params: {
          url,
          apikey: API_KEY
        },
        timeout: 60000
      });

      // ✅ Validación REAL según la API
      if (res.data?.status !== "true" || !res.data?.data?.video) {
        console.log("RESPUESTA ADONIX:", res.data);
        return client.reply(
          m.chat,
          "❌ No se pudo obtener el video.",
          m,
          global.channelInfo
        );
      }

      const data = res.data.data;

      const videoUrl = data.video;
      const title = data.title || "TikTok";
      const author = data.author?.name || "Desconocido";

      const caption =
        `🎬 *TikTok*\n` +
        `👤 Autor: ${author}\n` +
        `❤️ Likes: ${data.likes}\n` +
        `💬 Comentarios: ${data.comments}\n` +
        `🔁 Compartidos: ${data.shares}\n` +
        `👁️ Vistas: ${data.views}`;

      // 🎬 Enviar video usando channelInfo
      await client.sendMessage(
        m.chat,
        {
          video: { url: videoUrl },
          mimetype: "video/mp4",
          caption
        },
        { quoted: m, ...global.channelInfo }
      );

    } catch (err) {
      console.error("TIKTOK ERROR:", err.response?.data || err.message);
      await client.reply(
        m.chat,
        "❌ Error al descargar el video.",
        m,
        global.channelInfo
      );
    }
  }
};
