const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
const BASE = "https://api-sky.ultraplus.click";

module.exports = {
  command: ["ytvideo"],

  run: async (client, m, args) => {
    const [url, quality] = args;
    if (!url || !quality) return;

    try {
      await m.reply(`⬇️ Descargando en *${quality}p*...`);

      // Resolver (COBRA SOLO AQUÍ)
      const res = await axios.post(
        `${BASE}/youtube-mp4/resolve`,
        { url, type: "video", quality },
        { headers: { apikey: API_KEY } }
      );

      const videoUrl = res.data?.result?.media?.video;
      if (!videoUrl)
        return m.reply("❌ No se pudo generar el video.");

      // Enviar video
      await client.sendMessage(
        m.chat,
        {
          video: { url: videoUrl },
          mimetype: "video/mp4",
          caption: `🎬 Video descargado en ${quality}p`
        },
        { quoted: m }
      );

    } catch (err) {
      console.error(err);
      m.reply("❌ Error al descargar el video.");
    }
  }
};


