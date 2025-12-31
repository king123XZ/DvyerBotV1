const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
const API_URL = "https://api-sky.ultraplus.click/youtube-mp4/resolve";

const QUALITY_ORDER = ["360", "240", "144"];
const MAX_SIZE_MB = 1700;

module.exports = {
  command: ["ytdoc"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      const url = args[0];

      if (!url || !url.startsWith("http")) {
        return m.reply(
          "❌ Usa el comando así:\n" +
          ".ytdoc <link de YouTube>"
        );
      }

      await m.reply(
        "⬇️ Descargando video...\n" +
        "🎥 Calidad automática (hasta 360p)\n" +
        "⏳ Esto puede tardar unos segundos."
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

      // 🔍 Comprobar tamaño
      const head = await axios.head(link);
      const sizeBytes = Number(head.headers["content-length"] || 0);
      const sizeMB = sizeBytes / (1024 * 1024);

      if (sizeMB > MAX_SIZE_MB) {
        return m.reply(
          "⚠️ El archivo es demasiado pesado.\n\n" +
          `📦 Tamaño: ${sizeMB.toFixed(2)} MB\n` +
          `📛 Límite permitido: ${MAX_SIZE_MB} MB\n\n` +
          "📞 Para aumentar el límite, habla con el dueño del bot."
        );
      }

      const safeTitle = data.title.replace(/[\\/:*?"<>|]/g, "");
      const fileName = `${safeTitle} - ${usedQuality}p.mp4`;

      await client.sendMessage(
        m.chat,
        {
          document: { url: link },
          mimetype: "video/mp4",
          fileName,
          caption:
            `🎬 ${data.title}\n` +
            `📺 Calidad: ${usedQuality}p\n` +
            `📦 Tamaño: ${sizeMB.toFixed(2)} MB\n\n` +
            "KILLUA-BOT V1.00",
          buttons: [
            {
              buttonId: ".canal",
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
      m.reply("❌ Ocurrió un error al descargar el video.");
    }
  }
};