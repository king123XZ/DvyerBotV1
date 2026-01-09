const axios = require("axios");

// API GawrGura
const GAWRGURA_API = "https://gawrgura-api.onrender.com/download/ytdl";

const BOT_NAME = "KILLUA-BOT v1.00";

module.exports = {
  command: ["ytvideo"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      const url = args[0];

      if (!url || !url.startsWith("http")) {
        return client.reply(
          m.chat,
          "❌ Enlace de YouTube no válido.",
          m,
          global.channelInfo
        );
      }

      // ⏳ Mensaje inmediato (UX)
      await client.reply(
        m.chat,
        `⏳ *Descargando video...*\n✅ API: GawrGura\n🤖 ${BOT_NAME}`,
        m,
        global.channelInfo
      );

      // 📡 Llamada a la API
      const res = await axios.get(`${GAWRGURA_API}?url=${encodeURIComponent(url)}`, { timeout: 120000 });

      const videoData = res.data?.result;
      if (!res.data?.status || !videoData?.mp4) {
        throw new Error("Respuesta inválida de GawrGura API");
      }

      let videoUrl = videoData.mp4;
      let title = videoData.title || "video";

      // 🧼 Limpiar nombre del archivo
      title = title.replace(/[\\/:*?"<>|]/g, "").trim();
      if (title.length > 60) title = title.slice(0, 60);

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
      console.error("YTVIDEO GAWRGURA ERROR:", err.response?.data || err.message);
      await client.reply(
        m.chat,
        "❌ Error al descargar el video.",
        m,
        global.channelInfo
      );
    }
  }
};

