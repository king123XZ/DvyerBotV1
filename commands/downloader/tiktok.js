const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
const API_URL = "https://api-sky.ultraplus.click/tiktok";

module.exports = {
  command: ["tiktok", "tt"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      if (!args[0]) {
        return m.reply(
          "📌 Ingresa el enlace de TikTok\n\nEjemplo:\n!tiktok https://www.tiktok.com/@user/video/123"
        );
      }

      const url = args[0];
      await m.reply("⏳ Analizando video...");

      const { data } = await axios.post(
        API_URL,
        { url },
        {
          headers: {
            "Content-Type": "application/json",
            apikey: API_KEY
          }
        }
      );

      if (!data.status) {
        return m.reply("❌ No se pudo obtener el video.");
      }

      const result = data.result;

      // 🧠 Guardamos en cache
      global.ttCache = global.ttCache || {};
      global.ttCache[m.sender] = result;

      const caption = `🎵 *TikTok Detectado*

👤 Autor: ${result.author?.name || "Desconocido"}
📝 Título: ${result.title || "Sin título"}`;

      const buttons = [
        {
          buttonId: ".ttvideo",
          buttonText: { displayText: "🎬 Descargar Video" },
          type: 1
        },
        {
          buttonId: ".ttaudio",
          buttonText: { displayText: "🎵 Descargar Audio" },
          type: 1
        }
      ];

      await client.sendMessage(
        m.chat,
        {
          text: caption,
          footer: "YerTX Bot",
          buttons,
          headerType: 1
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("TIKTOK ERROR:", err.response?.data || err);
      m.reply("❌ Error al procesar TikTok.");
    }
  }
};



