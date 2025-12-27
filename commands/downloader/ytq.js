const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
const API = "https://api-sky.ultraplus.click/youtube-mp4/resolve";

module.exports = {
  command: ["ytq"],

  run: async (client, m, args) => {
    const quality = args[0];
    const url = global.ytCache?.[m.sender];

    if (!url) {
      return m.reply("❌ El enlace expiró. Usa play otra vez.");
    }

    try {
      await m.reply(`⬇️ Generando video en *${quality}p*...`);

      const res = await axios.post(
        API,
        {
          url,
          type: "video",
          quality: String(quality)
        },
        {
          headers: {
            "Content-Type": "application/json",
            apikey: API_KEY
          }
        }
      );

      if (!res.data?.status) {
        console.log(res.data);
        return m.reply("❌ No se pudo generar el enlace del video.");
      }

      const link =
        res.data.result?.download ||
        res.data.result?.url ||
        res.data.result?.link;

      if (!link) {
        return m.reply("❌ La API no devolvió el video.");
      }

      await client.sendMessage(m.chat, {
        video: { url: link },
        mimetype: "video/mp4",
        caption: `🎬 Video ${quality}p`
      }, { quoted: m });

      delete global.ytCache[m.sender];

    } catch (e) {
      console.error("YTQ ERROR:", e.response?.data || e);
      m.reply("❌ Error al generar el video.");
    }
  }
};
