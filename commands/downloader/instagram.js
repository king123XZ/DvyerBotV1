const axios = require("axios");

// ADONIX API
const ADONIX_API = "https://api-adonix.ultraplus.click/download/instagram";
const ADONIX_KEY = "dvyer";

// BOT
const BOT_NAME = "KILLUA-BOT v1.00";

module.exports = {
  command: ["instagram", "ig", "igdl"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      const url = args[0];

      if (!url || !url.startsWith("http")) {
        return client.reply(
          m.chat,
          "❌ Enlace de Instagram no válido.",
          m,
          global.channelInfo
        );
      }

      // ⏳ UX
      await client.reply(
        m.chat,
        `⏳ *Descargando Instagram...*\n` +
        `✅ API: ADONIX\n` +
        `🤖 ${BOT_NAME}`,
        m,
        global.channelInfo
      );

      // 📡 API
      const res = await axios.get(
        `${ADONIX_API}?url=${encodeURIComponent(url)}&apikey=${ADONIX_KEY}`,
        { timeout: 120000 }
      );

      if (!res.data?.status || !Array.isArray(res.data.data)) {
        throw new Error("Respuesta inválida de Adonix");
      }

      // 🔁 Enviar todos los medios (reels / carrusel)
      for (const media of res.data.data) {
        if (!media.url) continue;

        // 🎥 Video
        if (media.url.endsWith(".mp4")) {
          await client.sendMessage(
            m.chat,
            {
              video: { url: media.url },
              mimetype: "video/mp4"
            },
            { quoted: m, ...global.channelInfo }
          );
        } 
        // 🖼 Imagen
        else {
          await client.sendMessage(
            m.chat,
            {
              image: { url: media.url }
            },
            { quoted: m, ...global.channelInfo }
          );
        }
      }

    } catch (err) {
      console.error("INSTAGRAM ADONIX ERROR:", err.response?.data || err.message);
      await client.reply(
        m.chat,
        "❌ Error al descargar contenido de Instagram.",
        m,
        global.channelInfo
      );
    }
  }
};

