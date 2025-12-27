const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
const BASE = "https://api-sky.ultraplus.click";

module.exports = {
  command: ["ytq"],

  run: async (client, m, args) => {
    const [url, quality] = args;
    if (!url || !quality) return;

    try {
      await m.reply(`⬇️ Generando video en *${quality}p*...`);

      // 🔹 PASO 3: GENERAR LINK REAL (COBRA)
      const res = await axios.post(
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

      const videoUrl = res.data?.result?.media?.video;
      if (!videoUrl) {
        return m.reply("❌ No se pudo generar el video.");
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

    } catch (e) {
      console.error(e);
      m.reply("❌ Error descargando el video.");
    }
  }
};
