const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
const API = "https://api-sky.ultraplus.click/youtube-mp4/resolve";

module.exports = {
  command: ["ytq"],

  run: async (client, m, args) => {
    const quality = args[0];
    const url = global.ytCache?.[m.sender];

    if (!url) {
      return m.reply("❌ El enlace expiró. Usa *play* otra vez.");
    }

    try {
      await m.reply(`⬇️ Descargando video en *${quality}p*...`);

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

      const link = res.data?.result?.media?.direct;

      if (!link) {
        console.log("RESPUESTA API:", res.data);
        return m.reply("❌ No se pudo obtener el enlace del video.");
      }

      await client.sendMessage(
        m.chat,
        {
          video: { url: link },
          mimetype: "video/mp4",
          caption: `🎬 ${res.data.result.title}\n📺 Calidad: ${quality}p`
        },
        { quoted: m }
      );

      delete global.ytCache[m.sender];

    } catch (e) {
      console.error("YTQ ERROR:", e.response?.data || e);
      m.reply("❌ Error al generar el video.");
    }
  }
};

};

