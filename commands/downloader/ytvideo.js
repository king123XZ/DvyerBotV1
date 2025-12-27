const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
const BASE_URL = "https://api-sky.ultraplus.click";

module.exports = {
  command: ["ytvideo"],
  category: "downloader",
  description: "Descargar video YouTube 360p",

  run: async (client, m, args) => {
    if (!args[0]) {
      return m.reply("⚠️ Usa: ytvideo <link de YouTube>");
    }

    const url = args[0];

    try {
      m.reply("🔍 Obteniendo opciones de video...");

      // 1️⃣ OBTENER OPCIONES (NO COBRA)
      const optionsRes = await axios.post(
        `${BASE_URL}/youtube-mp4`,
        { url },
        {
          headers: {
            "Content-Type": "application/json",
            apikey: API_KEY
          }
        }
      );

      const options = optionsRes.data?.result;

      if (!options || !Array.isArray(options)) {
        console.log("Respuesta opciones:", optionsRes.data);
        return m.reply("❌ No se pudieron obtener opciones de video.");
      }

      // 🔒 FORZAR 360p
      const quality360 = options.find(q => q.quality === "360");

      if (!quality360) {
        return m.reply("❌ El video no tiene calidad 360p disponible.");
      }

      m.reply("⬇️ Generando link en *360p*...");

      // 2️⃣ RESOLVER LINK (COBRA)
      const resolveRes = await axios.post(
        `${BASE_URL}/youtube-mp4/resolve`,
        {
          url,
          type: "video",
          quality: "360"
        },
        {
          headers: {
            "Content-Type": "application/json",
            apikey: API_KEY
          }
        }
      );

      const videoUrl = resolveRes.data?.result?.media?.video;

      if (!videoUrl) {
        console.log("Respuesta resolve:", resolveRes.data);
        return m.reply("❌ No se pudo generar el link del video.");
      }

      // 3️⃣ ENVIAR VIDEO
      await client.sendMessage(
        m.chat,
        {
          video: { url: videoUrl },
          mimetype: "video/mp4",
          caption: "🎬 Video descargado en *360p*"
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("❌ Error ytvideo:", err?.response?.data || err);
      m.reply("❌ Error al procesar el video.");
    }
  }
};

