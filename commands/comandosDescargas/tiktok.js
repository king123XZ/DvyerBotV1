const axios = require("axios");

// API
const DOWNLOAD_API = "https://gawrgura-api.onrender.com/download/tiktok";

module.exports = {
  command: ["tiktok", "tt"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      const url = args[0];

      if (!url || !/tiktok\.com/.test(url)) {
        return client.reply(
          m.chat,
          "❌ Enlace de TikTok no válido.\nEjemplo:\n.tiktok https://www.tiktok.com/@user/video/123",
          m,
          global.channelInfo
        );
      }

      // Guardar URL temporalmente (cache simple)
      global.ttCache = global.ttCache || {};
      global.ttCache[m.sender] = url;

      // Botones
      const buttons = [
        {
          buttonId: "tt_video",
          buttonText: { displayText: "🎥 Video" },
          type: 1
        },
        {
          buttonId: "tt_audio",
          buttonText: { displayText: "🎧 Audio" },
          type: 1
        },
        {
          buttonId: "tt_both",
          buttonText: { displayText: "🎥 + 🎧 Ambos" },
          type: 1
        }
      ];

      await client.sendMessage(
        m.chat,
        {
          text: "📥 *¿Qué deseas descargar de TikTok?*",
          buttons,
          headerType: 1
        },
        { quoted: m, ...global.channelInfo }
      );

    } catch (err) {
      console.error(err);
      client.reply(m.chat, "❌ Error al procesar TikTok.", m);
    }
  }
};



