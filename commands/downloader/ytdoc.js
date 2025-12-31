const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
const API_URL = "https://api-sky.ultraplus.click/youtube-mp4/resolve";

// Máx 360p para estabilidad
const QUALITY_ORDER = ["360", "240", "144"];

module.exports = {
  command: ["ytdoc"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      const url = args[0];

      if (!url || !url.startsWith("http")) {
        return m.reply("❌ Usa: .ytdoc <link de YouTube>");
      }

      await m.reply(
        "📥 Descargando video\n" +
        "📺 Calidad automática: *hasta 360p*\n" +
        "⏱️ Tiempo estimado: *15–30 segundos*"
      );

      let data, link, usedQuality;

      // 🔁 Prueba calidades automáticamente
      for (const quality of QUALITY_ORDER) {
        try {
          const res = await axios.post(
            API_URL,
            {
              url,
              type: "video",
              quality
            },
            {
              headers: { apikey: API_KEY },
              timeout: 60000
            }
          );

          data = res.data?.result;
          link = data?.media?.direct;

          if (link) {
            usedQuality = quality;
            break;
          }
        } catch (_) {}
      }

      if (!link) {
        return m.reply("❌ No se pudo generar el video.");
      }

      // 🧼 Nombre seguro
      const safeTitle = data.title.replace(/[\\/:*?"<>|]/g, "");
      const fileName = `${safeTitle} - ${usedQuality}p.mp4`;

      await client.sendMessage(
        m.chat,
        {
          document: { url: link },
          mimetype: "video/mp4",
          fileName,
          caption:
            `📄 *${data.title}*\n` +
            `📺 Calidad usada: *${usedQuality}p*\n` +
            `✅ Envío como documento`
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("YTDOC ERROR:", err.response?.data || err);
      m.reply("❌ Error al descargar. Intenta más tarde.");
    }
  }
};