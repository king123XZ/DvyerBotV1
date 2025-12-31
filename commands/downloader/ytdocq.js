const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
const API_URL = "https://api-sky.ultraplus.click/youtube-mp4/resolve";

// 🔒 Máximo permitido
const QUALITY_ORDER = ["360", "240", "144"];

if (!global.ytDocCache) global.ytDocCache = {};
if (!global.ytCooldown) global.ytCooldown = {};

module.exports = {
  command: ["ytdocq"],
  category: "downloader",

  run: async (client, m) => {
    try {
      // ⏳ Cooldown anti-spam
      const now = Date.now();
      if (global.ytCooldown[m.sender] && now - global.ytCooldown[m.sender] < 15000) {
        return m.reply("⏳ Espera unos segundos antes de otra descarga.");
      }
      global.ytCooldown[m.sender] = now;

      const cache = global.ytDocCache[m.sender];
      if (!cache?.url) {
        return m.reply("❌ El enlace expiró. Usa *ytdoc* otra vez.");
      }

      await m.reply(
        "🎥 Preparando video...\n" +
        "📺 Calidad automática: hasta *360p*\n" +
        "⏱️ Tiempo estimado: *15–30 segundos*"
      );

      let data, link, usedQuality;

      // 🔁 Selección automática y segura
      for (const quality of QUALITY_ORDER) {
        try {
          const res = await axios.post(
            API_URL,
            {
              url: cache.url,
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

      if (!link) throw "NO_QUALITY_AVAILABLE";

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
            `✅ Envío seguro`
        },
        { quoted: m }
      );

      delete global.ytDocCache[m.sender];

    } catch (err) {
      console.error("YTDOCQ ERROR:", err);
      m.reply("❌ No se pudo descargar el video. Intenta más tarde.");
      delete global.ytDocCache[m.sender];
    }
  }
};