const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
const API_URL = "https://api-sky.ultraplus.click/youtube-mp4/resolve";

module.exports = {
  command: ["ytdocq"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      const quality = args[0];
      const url = global.ytDocCache?.[m.sender];

      if (!url) {
        return m.reply("❌ El enlace expiró. Usa *ytdoc* nuevamente.");
      }

      if (!quality) {
        return m.reply("❌ Calidad no válida.");
      }

      await m.reply(`⬇️ Descargando *${quality}p* como documento...`);

      const api = await axios.post(
        API_URL,
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

      const data = api.data?.result;
      const direct = data?.media?.direct;

      if (!direct) {
        console.log("API ERROR:", api.data);
        return m.reply("❌ No se pudo generar el enlace del video.");
      }

      // Descargar archivo
      const file = await axios.get(direct, {
        responseType: "arraybuffer"
      });

      const title = data.title || "youtube_video";

      // Enviar como DOCUMENTO
      await client.sendMessage(
        m.chat,
        {
          document: file.data,
          mimetype: "video/mp4",
          fileName: `${title} (${quality}p).mp4`,
          caption: `📄🎬 *${title}*\n📺 Calidad: ${quality}p`
        },
        { quoted: m }
      );

      delete global.ytDocCache[m.sender];

    } catch (err) {
      console.error("YT DOC ERROR:", err.response?.data || err);
      m.reply("❌ Error al descargar el video en documento.");
    }
  }
};
