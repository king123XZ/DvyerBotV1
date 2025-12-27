const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";

module.exports = {
  command: ["ytvideo"],
  description: "Descargar video MP4 de YouTube",
  category: "downloader",

  run: async (client, m, args) => {
    try {
      if (!args.length) {
        return m.reply("⚠️ Ingresa un enlace de YouTube.");
      }

      const videoUrl = args[0];
      await m.reply("⏳ Obteniendo opciones de descarga...");

      // ===============================
      // 1️⃣ OBTENER OPCIONES (NO COBRA)
      // ===============================
      const optionsRes = await axios.post(
        "https://api-sky.ultraplus.click/youtube-mp4",
        { url: videoUrl },
        {
          headers: {
            "Content-Type": "application/json",
            apikey: API_KEY
          }
        }
      );

      const options = optionsRes.data?.result;
      if (!options || !options.length) {
        return m.reply("❌ No se pudieron obtener opciones.");
      }

      // 👉 Elegimos 360p por defecto (estable y liviano)
      const selected = options.find(o => o.quality === "360") || options[0];

      await m.reply(`⬇️ Descargando video (${selected.quality}p)...`);

      // ===============================
      // 2️⃣ RESOLVER LINK REAL (COBRA)
      // ===============================
      const resolveRes = await axios.post(
        "https://api-sky.ultraplus.click/youtube-mp4/resolve",
        {
          url: videoUrl,
          type: "video",
          quality: selected.quality
        },
        {
          headers: {
            "Content-Type": "application/json",
            apikey: API_KEY
          }
        }
      );

      if (!resolveRes.data?.status) {
        return m.reply("❌ No se pudo generar el link real.");
      }

      const result = resolveRes.data.result;

      // ===============================
      // 3️⃣ ENVIAR VIDEO
      // ===============================
      await client.sendMessage(
        m.chat,
        {
          video: { url: result.media.video },
          mimetype: "video/mp4",
          fileName: `${result.title || "video"}.mp4`,
          caption: `🎬 *${result.title || "YouTube Video"}*\n📺 Calidad: ${selected.quality}p`
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("YTVIDEO ERROR:", err.response?.data || err.message);
      m.reply("❌ Error al descargar el video.");
    }
  }
};
