const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
const API_URL = "https://api-sky.ultraplus.click/youtube-mp4/resolve";

const QUALITY_ORDER = ["360", "240", "144"];

// 📢 ID de tu canal
const CHANNEL_JID = "0029VaH4xpUBPzjendcoBI2c@newsletter";

module.exports = {
  command: ["ytdoc"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      const url = args[0];

      if (!url || !url.startsWith("http")) {
        return m.reply(
          "❌ Usa correctamente:\n" +
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
            { headers: { apikey: API_KEY }, timeout: 60000 }
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

      const safeTitle = data.title.replace(/[\\/:*?"<>|]/g, "");
      const fileName = `${safeTitle} - ${usedQuality}p.mp4`;

      const messagePayload = {
        document: { url: link },
        mimetype: "video/mp4",
        fileName,
        caption:
          `📄 *${data.title}*\n` +
          `📺 Calidad: *${usedQuality}p*\n\n` +
          `🤖 *KILLUA-BOT V1.00*`,
        footer: "KILLUA-BOT V1.00",
        buttons: [
          {
            buttonId: "canal",
            buttonText: { displayText: "📢 Ver canal" },
            type: 1,
            url: "https://whatsapp.com/channel/0029VaH4xpUBPzjendcoBI2c"
          }
        ],
        headerType: 1
      };

      // 📩 Enviar al chat
      await client.sendMessage(m.chat, messagePayload, { quoted: m });

      // 📢 Enviar al canal
      await client.sendMessage(CHANNEL_JID, messagePayload);

    } catch (err) {
      console.error("YTDOC ERROR:", err);
      m.reply(
        "❌ Error al descargar el video.\n\n" +
        "🤖 *KILLUA-BOT V1.00*"
      );
    }
  }
};