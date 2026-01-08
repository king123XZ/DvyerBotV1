const axios = require("axios");

// 🔵 SKY
const SKY_API = "https://api-sky.ultraplus.click/youtube-mp4/resolve";
const SKY_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";

// 🟢 ADONIX
const ADONIX_API = "https://api-adonix.ultraplus.click/download/ytvideo";
const ADONIX_KEY = "AdonixKeythtnjs6661";

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

      // 🏠 SKY HOST → CALIDAD AUTOMÁTICA
      if (global.botHost === "sky") {
        await m.reply(
          "🎥 Preparando video...\n" +
          "📺 Calidad automática hasta *360p*\n" +
          "⏱️ Tiempo estimado: *15–30 segundos*"
        );

        let data, link, usedQuality;

        for (const quality of QUALITY_ORDER) {
          try {
            const res = await axios.post(
              SKY_API,
              { url: cache.url, type: "video", quality },
              { headers: { apikey: SKY_KEY }, timeout: 60000 }
            );

            data = res.data?.result;
            link = data?.media?.direct;

            if (link) {
              usedQuality = quality;
              break;
            }
          } catch {}
        }

        if (!link) throw "NO_QUALITY_AVAILABLE";

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
        return;
      }

      // 🌍 OTRO HOST → ADONIX (SIN CALIDAD)
      await m.reply("⬇️ Descargando video (calidad disponible)...");

      const res = await axios.get(
        `${ADONIX_API}?url=${encodeURIComponent(cache.url)}&apikey=${ADONIX_KEY}`,
        { timeout: 60000 }
      );

      if (!res.data?.status || !res.data?.data?.url) {
        throw "ADONIX_FAIL";
      }

      const title = (res.data.data.title || "video").replace(/[\\/:*?"<>|]/g, "");

      await client.sendMessage(
        m.chat,
        {
          document: { url: res.data.data.url },
          mimetype: "video/mp4",
          fileName: `${title}.mp4`,
          caption: "📄 Video descargado\nKILLUA-BOT"
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
