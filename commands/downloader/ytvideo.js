const axios = require("axios");

// ADONIX API
const ADONIX_API = "https://api-adonix.ultraplus.click/download/ytvideo";
const ADONIX_KEY = "dvyer";

// BOT
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
        `⏳ *Descargando video...*\n` +
        `✅ API: ADONIX\n` +
        `🤖 ${BOT_NAME}`,
        m,
        global.channelInfo
      );

      // 📡 Llamada a la API
      const res = await axios.get(
        `${ADONIX_API}?url=${encodeURIComponent(url)}&apikey=${ADONIX_KEY}`,
        { timeout: 60000 }
      );

      if (!res.data || !res.data.data || !res.data.data.url) {
        throw new Error("Respuesta inválida de Adonix");
      }

      let videoUrl = res.data.data.url;
      let title = res.data.data.title || "video";

      // 🧼 Limpiar nombre
      title = title.replace(/[\\/:*?"<>|]/g, "").trim().slice(0, 60);

      // 🎥 Enviar video usando channelInfo
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
      console.error("YTVIDEO ADONIX ERROR:", err.response?.data || err.message);
      await client.reply(
        m.chat,
        "❌ Error al descargar el video.",
        m,
        global.channelInfo
      );
    }
  }
};

