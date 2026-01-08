const axios = require("axios");

// 🔵 SKY
const SKY_API = "https://api-sky.ultraplus.click/youtube-mp4/resolve";
const SKY_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";

// 🟢 ADONIX
const ADONIX_API = "https://api-adonix.ultraplus.click/download/ytvideo";
const ADONIX_KEY = "AdonixKeythtnjs6661";

// 🤖 Bot
const BOT_NAME = "KILLUA-BOT v1.00";

// SKY → orden automático
const QUALITY_ORDER = ["360", "240", "144"];

if (!global.ytDocCache) global.ytDocCache = {};
if (!global.ytCooldown) global.ytCooldown = {};

module.exports = {
  command: ["ytdocq"],
  category: "downloader",

  run: async (client, m) => {
    try {
      // ⏳ Cooldown
      const now = Date.now();
      if (global.ytCooldown[m.sender] && now - global.ytCooldown[m.sender] < 15000) {
        return m.reply("⏳ Espera unos segundos antes de otra descarga.");
      }
      global.ytCooldown[m.sender] = now;

      const cache = global.ytDocCache[m.sender];
      if (!cache?.url) {
        return m.reply("❌ El enlace expiró. Usa *ytdoc* otra vez.");
      }

      // ======================
      // ☁️ SKY (set-host)
      // ======================
      if (global.hosting === "sky") {

        // ⚡ MENSAJE INMEDIATO
        await client.sendMessage(
          m.chat,
          {
            text:
              `⏳ *Descargando video...*\n` +
              `📺 Calidad automática (hasta 360p)\n` +
              `✅ API: SKY\n` +
              `🤖 ${BOT_NAME}`
          },
          { quoted: m }
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

        if (!link) {
          delete global.ytDocCache[m.sender];
          return m.reply("❌ No se pudo generar el video.");
        }

        const safeTitle = (data.title || "video")
          .replace(/[\\/:*?"<>|]/g, "")
          .trim();

        await client.sendMessage(
          m.chat,
          {
            document: { url: link },
            mimetype: "video/mp4",
            fileName: `${safeTitle} - ${usedQuality}p.mp4`,
            caption:
              `📄 ${data.title}\n` +
              `📺 Calidad: ${usedQuality}p\n` +
              `✅ API: SKY\n` +
              `🤖 ${BOT_NAME}`
          },
          { quoted: m }
        );

        delete global.ytDocCache[m.sender];
        return;
      }

      // ======================
      // 🌍 ADONIX
      // ======================
      await client.sendMessage(
        m.chat,
        {
          text:
            `⏳ *Descargando video...*\n` +
            `📺 Calidad predeterminada\n` +
            `✅ API: ADONIX\n` +
            `🤖 ${BOT_NAME}`
        },
        { quoted: m }
      );

      const res = await axios.get(
        `${ADONIX_API}?url=${encodeURIComponent(cache.url)}&apikey=${ADONIX_KEY}`,
        { timeout: 60000 }
      );

      if (!res.data?.status || !res.data?.data?.url) {
        throw new Error("ADONIX_FAIL");
      }

      const title = (res.data.data.title || "video")
        .replace(/[\\/:*?"<>|]/g, "")
        .trim();

      await client.sendMessage(
        m.chat,
        {
          document: { url: res.data.data.url },
          mimetype: "video/mp4",
          fileName: `${title}.mp4`,
          caption:
            `📄 ${res.data.data.title}\n` +
            `✅ API: ADONIX\n` +
            `🤖 ${BOT_NAME}`
        },
        { quoted: m }
      );

      delete global.ytDocCache[m.sender];

    } catch (err) {
      console.error("YTDOCQ ERROR:", err.response?.data || err.message);
      delete global.ytDocCache[m.sender];
      m.reply("❌ No se pudo descargar el video.");
    }
  }
};

