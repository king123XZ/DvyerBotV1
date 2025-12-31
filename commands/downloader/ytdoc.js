const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
const API_URL = "https://api-sky.ultraplus.click/youtube-mp4/resolve";

// Prioridad de calidad (máx 360p)
const QUALITY_ORDER = ["360", "240", "144"];

module.exports = {
  command: ["ytdoc"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      const url = args[0];

      if (!url || !url.startsWith("http")) {
        return m.reply(
          "❌ *Uso correcto:*\n" +
          ".ytdoc <link de YouTube>\n\n" +
          "🤖 *KILLUA-BOT V1.00*"
        );
      }

      // Mensaje inicial
      await m.reply(
        "📥 *Descargando video*\n" +
        "📺 Calidad automática: *hasta 360p*\n" +
        "⏱️ Tiempo estimado: *15–30 segundos*\n\n" +
        "🤖 *KILLUA-BOT V1.00*"
      );

      let data, link, usedQuality;

      // Intentar calidades en orden
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
        } catch (e) {
          continue;
        }
      }

      if (!link) {
        return m.reply(
          "❌ No se pudo generar el video.\n" +
          "Prueba con otro enlace.\n\n" +
          "🤖 *KILLUA-BOT V1.00*"
        );
      }

      // Limpiar nombre del archivo
      const safeTitle = data.title.replace(/[\\/:*?"<>|]/g, "");
      const fileName = `${safeTitle} - ${usedQuality}p.mp4`;

      // Enviar DOCUMENTO + BOTÓN VERDE
      await client.sendMessage(
        m.chat,
        {
          document: { url: link },
          mimetype: "video/mp4",
          fileName,
          caption:
            `📄 *${data.title}*\n` +
            `📺 Calidad: *${usedQuality}p*\n\n` +
            `🤖 *KILLUA-BOT V1.00*`,
          buttons: [
            {
              buttonId: "ver_canal",
              buttonText: { displayText: "📢 Ver canal" },
              type: 1,
              url: "https://whatsapp.com/channel/0029VaH4xpUBPzjendcoBI2c"
            }
          ],
          headerType: 1
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("YTDOC ERROR:", err);
      m.reply(
        "❌ Error al descargar el video.\n" +
        "Intenta con otro enlace.\n\n" +
        "🤖 *KILLUA-BOT V1.00*"
      );
    }
  }
};