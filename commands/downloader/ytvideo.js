const axios = require("axios");

// ADONIX API
const ADONIX_API = "https://api-adonix.ultraplus.click/download/ytvideo";
const ADONIX_KEY = "dvyer";

// BOT
const BOT_NAME = "KILLUA-BOT v1.00";

module.exports = {
  command: ["yt2"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      const url = args[0];

      if (!url || !url.startsWith("http")) {
        return m.reply("❌ Enlace de YouTube no válido.");
      }

      // Mensaje inmediato (UX)
      await m.reply(
        `⏳ *Descargando video...*\n` +
        `✅ API: ADONIX\n` +
        `🤖 ${BOT_NAME}`
      );

      // Llamada a la API
      const res = await axios.get(
        `${ADONIX_API}?url=${encodeURIComponent(url)}&apikey=${ADONIX_KEY}`,
        { timeout: 60000 }
      );

      if (!res.data || !res.data.data || !res.data.data.url) {
        throw new Error("Respuesta inválida de Adonix");
      }

      let videoUrl = res.data.data.url;
      let title = res.data.data.title || "video";

      // Limpiar nombre
      title = title.replace(/[\\/:*?"<>|]/g, "").trim().slice(0, 60);

      // Enviar video (FORMA CORRECTA)
      await client.sendMessage(
        m.chat,
        {
          video: { url: videoUrl },
          mimetype: "video/mp4",
          fileName: `${title}.mp4`
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("YTVIDEO ADONIX ERROR:", err.response?.data || err.message);
      await m.reply("❌ Error al descargar el video.");
    }
  }
};

