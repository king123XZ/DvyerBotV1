const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
const API_URL = "https://api-sky.ultraplus.click/youtube-mp4/resolve";

const VALID_QUALITIES = ["144", "240", "360", "480"];

module.exports = {
  command: ["ytdocq"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      const quality = args[0];
      const owner = args[1];

      if (owner !== m.sender) return;

      if (!VALID_QUALITIES.includes(quality)) {
        return m.reply("❌ Calidad no permitida.");
      }

      const cache = global.ytDocCache?.[m.sender];
      if (!cache) {
        return m.reply("❌ El enlace expiró. Usa *ytdoc* otra vez.");
      }

      await m.reply(`⬇️ Descargando documento *${quality}p*...`);

      const res = await axios.post(
        API_URL,
        {
          url: cache.url,
          type: "video",
          quality
        },
        {
          headers: { apikey: API_KEY },
          timeout: 60000 // ⏱️ estable
        }
      );

      const data = res.data?.result;
      const link = data?.media?.direct;

      if (!link) {
        console.log("RESPUESTA API:", res.data);
        return m.reply("❌ No se pudo generar el video.");
      }

      await client.sendMessage(
        m.chat,
        {
          document: { url: link },
          mimetype: "video/mp4",
          fileName: `${data.title} - ${quality}p.mp4`,
          caption: `📄 ${data.title}\n📺 Calidad: ${quality}p`
        },
        { quoted: m }
      );

      delete global.ytDocCache[m.sender];

    } catch (err) {
      console.error("YTDOCQ ERROR:", err.response?.data || err.message);
      m.reply("❌ Error al descargar. Intenta otra calidad.");
      delete global.ytDocCache[m.sender];
    }
  }
};
