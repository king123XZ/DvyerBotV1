const axios = require("axios");

const API_KEY = "dvyer";

// 🔴 TU VIDEO DE MEDIAFIRE AQUÍ
const TUTORIAL_MEDIAFIRE =
  "https://www.mediafire.com/file/m2htdkmnu4jhy3j/2026-01-10-001054428.mp4/file";

module.exports = {
  command: ["tutorial_vlc"],
  category: "general",

  run: async (client, m) => {
    await client.reply(
      m.chat,
      "⏳ Descargando *video tutorial*...\nEspera un momento.",
      m
    );

    try {
      const res = await axios.get(
        "https://api-adonix.ultraplus.click/download/mediafire",
        {
          params: { apikey: API_KEY, url: TUTORIAL_MEDIAFIRE },
          timeout: 0
        }
      );

      const file = res.data.result[0];
      const data = await axios.get(file.link, {
        responseType: "arraybuffer",
        timeout: 0
      });

      await client.sendMessage(
        m.chat,
        {
          video: Buffer.from(data.data),
          mimetype: "video/mp4",
          caption: "🎥 Tutorial: Cómo reproducir videos correctamente"
        },
        { quoted: m }
      );
    } catch (e) {
      await client.reply(m.chat, "❌ Error al descargar el tutorial.", m);
    }
  }
};
