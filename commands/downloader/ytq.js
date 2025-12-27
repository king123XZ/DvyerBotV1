const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
const BASE = "https://api-sky.ultraplus.click";

module.exports = {
  command: ["ytq"],

  run: async (client, m, args) => {
    const url = args[0];
    const quality = args[1];

    if (!url || !quality) {
      return m.reply("❌ Error al seleccionar calidad.");
    }

    try {
      await m.reply(`⬇️ Descargando video en *${quality}p*...`);

      const resolve = await axios.post(
        `${BASE}/youtube-mp4/resolve`,
        {
          url,
          type: "video",
          quality
        },
        {
          headers: {
            "Content-Type": "application/json",
            apikey: API_KEY
          }
        }
      );

      const videoUrl = resolve.data?.result?.url;
      if (!videoUrl) {
        return m.reply("❌ No se pudo generar el enlace del video.");
      }

      await client.sendMessage(
        m.chat,
        {
          video: { url: videoUrl },
          mimetype: "video/mp4",
          caption: `🎬 Video ${quality}p`
        },
        { quoted: m }
      );

    } catch (err) {
      console.error(err);
      m.reply("❌ Error descargando el video.");
    }
  }
};
