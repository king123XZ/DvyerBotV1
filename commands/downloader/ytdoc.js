const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
const API_URL = "https://api-sky.ultraplus.click/youtube-mp4/resolve";

// Solo hasta 360p
const QUALITY_ORDER = ["360", "240", "144"];

module.exports = {
  command: ["ytdoc"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      const url = args[0];

      if (!url || !url.startsWith("http")) {
        return m.reply(
          "❌ Uso correcto:\n" +
          ".ytdoc <link de YouTube>\n\n" +
          "🤖 *KILLUA-BOT V1.00*"
        );
      }

      await m.reply(
        "📥 *Descargando video*\n" +
        "📺 Calidad automática: *hasta 360p*\n" +
        "⏱️ Tiempo estimado: *15–30 segundos*\n\n" +
        "🤖 *KILLUA-BOT V1.00*"
      );

      let data, link, usedQuality;

      for (const quality of QUALITY_ORDER) {
        try {
          const res = await axios.post(
            API_URL,
            { url, type: "video", quality },
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
          "Intenta con otro enlace.\n\n" +
          "🤖 *KILLUA-BOT V1.00*"
        );
      }

      // Nombre seguro
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
            `📺 Calidad: *${usedQuality}p*\n\n` +
            `🤖 *KILLUA-BOT V1.00*`,
          contextInfo: {
            externalAdReply: {
              title: "KILLUA-BOT V1.00",
              body: "📢 Ver canal oficial",
              mediaType: 1,
              sourceUrl: "https://whatsapp.com/channel/0029VaH4xpUBPzjendcoBI2c",
              showAdAttribution: true
            }
          }
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("YTDOC ERROR:", err);
      m.reply(
        "❌ Error al descargar el video.\n" +
        "Intenta más tarde.\n\n" +
        "🤖 *KILLUA-BOT V1.00*"
      );
    }
  }
};