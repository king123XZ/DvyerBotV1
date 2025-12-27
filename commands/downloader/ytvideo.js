const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";

module.exports = {
  command: ["ytvideo"],
  description: "Descargar video MP4 de YouTube",
  category: "downloader",

  run: async (client, m, args) => {
    try {
      if (!args.length)
        return m.reply("⚠️ Ingresa un link de YouTube.");

      const url = args[0];
      await m.reply("⏳ Obteniendo calidades disponibles...");

      // 1️⃣ OPCIONES (NO COBRA)
      const opt = await axios.post(
        "https://api-sky.ultraplus.click/youtube-mp4",
        { url },
        { headers: { apikey: API_KEY } }
      );

      const options = opt.data?.result;
      if (!options || !options.length)
        return m.reply("❌ No se encontraron opciones.");

      // 🔒 Usamos 360p (estable y liviano)
      const selected = options.find(o => o.quality === "360") || options[0];

      await m.reply(`⬇️ Descargando en ${selected.quality}p...`);

      // 2️⃣ RESOLVE (COBRA SOLO SI FUNCIONA)
      const res = await axios.post(
        "https://api-sky.ultraplus.click/youtube-mp4/resolve",
        {
          url,
          type: "video",
          quality: selected.quality
        },
        { headers: { apikey: API_KEY } }
      );

      if (!res.data?.status)
        return m.reply("❌ No se pudo generar el video.");

      const video = res.data.result;

      await client.sendMessage(
        m.chat,
        {
          video: { url: video.media.video },
          mimetype: "video/mp4",
          fileName: `${video.title || "video"}.mp4`,
          caption: `🎬 *${video.title || "YouTube"}*\n📺 Calidad: ${selected.quality}p`
        },
        { quoted: m }
      );

    } catch (e) {
      console.error("YTVIDEO:", e.response?.data || e.message);
      m.reply("❌ Error al procesar el video.");
    }
  }
};

