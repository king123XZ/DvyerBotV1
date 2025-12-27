const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";

module.exports = {
  command: ["ytvideo"],
  description: "Descargar video de YouTube en 360p",
  category: "downloader",

  run: async (client, m, args) => {
    try {
      if (!args.length) {
        return m.reply("⚠️ Ingresa un enlace de YouTube.");
      }

      const url = args[0];
      await m.reply("⏳ Obteniendo información del video...");

      // ===============================
      // 1️⃣ OBTENER OPCIONES (NO COBRA)
      // ===============================
      const opt = await axios.post(
        "https://api-sky.ultraplus.click/youtube-mp4",
        { url },
        {
          headers: {
            "Content-Type": "application/json",
            apikey: API_KEY
          }
        }
      );

      // 🔎 DEBUG REAL (por si cambia otra vez)
      console.log("MP4 OPTIONS RESPONSE:", opt.data);

      if (!opt.data?.status) {
        return m.reply("❌ La API no devolvió estado válido.");
      }

      const options = opt.data?.result?.options;
      if (!options || !options.length) {
        return m.reply("❌ No se pudieron obtener opciones de video.");
      }

      // 🔒 SIEMPRE 360p
      const quality = "360";

      await m.reply("⬇️ Descargando video en *360p*...");

      // ===============================
      // 2️⃣ RESOLVER LINK REAL (COBRA)
      // ===============================
      const res = await axios.post(
        "https://api-sky.ultraplus.click/youtube-mp4/resolve",
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

      console.log("MP4 RESOLVE RESPONSE:", res.data);

      if (!res.data?.status) {
        return m.reply("❌ No se pudo generar el enlace del video.");
      }

      const video = res.data.result;

      // ===============================
      // 3️⃣ ENVIAR VIDEO
      // ===============================
      await client.sendMessage(
        m.chat,
        {
          video: { url: video.media.video },
          mimetype: "video/mp4",
          fileName: `${video.title || "youtube"}.mp4`,
          caption: `🎬 *${video.title || "YouTube Video"}*\n📺 Calidad: 360p`
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("YTVIDEO ERROR:", err.response?.data || err.message);
      m.reply("❌ Error al procesar el video.");
    }
  }
};

};

