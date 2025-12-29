const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
const API_URL = "https://api-sky.ultraplus.click/tools/xvideos";

module.exports = {
  command: ["xvideosdl", "descargarvideo"],
  category: "downloader",
  description: "Descarga videos desde enlaces directos",
  use: "xvideodl <link>",

  run: async (client, m, args) => {
    try {
      const url = args[0];

      if (!url || !url.startsWith("http")) {
        return m.reply("❌ Ingresa un enlace de video válido.");
      }

      await m.reply("⬇️ Descargando video...");

      const { data } = await axios.post(
        API_URL,
        { url },
        {
          headers: {
            "Content-Type": "application/json",
            apikey: API_KEY
          },
          timeout: 20000
        }
      );

      if (!data.status || !data.result?.data) {
        return m.reply("❌ No se pudo procesar el video.");
      }

      // 👉 Elegimos la mejor calidad disponible
      const videoUrl =
        data.result.data.high ||
        data.result.data.medium ||
        data.result.data.low;

      if (!videoUrl) {
        return m.reply("❌ No hay enlaces de video disponibles.");
      }

      await client.sendMessage(
        m.chat,
        {
          video: { url: videoUrl },
          mimetype: "video/mp4",
          caption: "🎬 Video descargado correctamente"
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("VIDEODL ERROR:", err.response?.data || err.message);
      m.reply("❌ Error al descargar el video.");
    }
  }
};
