const axios = require("axios");

// 🔵 SKY
const SKY_API = "https://api-sky.ultraplus.click/youtube-mp4/resolve";
const SKY_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";

// 🟢 ADONIX
const ADONIX_API = "https://api-adonix.ultraplus.click/download/ytvideo";
const ADONIX_KEY = "dvyer";

// 🤖 Bot
const BOT_NAME = "KILLUA-BOT v1.00";

// SKY → orden automático de calidad
const QUALITY_ORDER = ["360", "240", "144"];

module.exports = {
  command: ["ytdoc"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      const url = args[0];
      if (!url || !url.startsWith("http")) {
        return m.reply("❌ Usa:\n.ytdoc <link de YouTube>");
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
              { url, type: "video", quality },
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
          return m.reply("❌ No se pudo generar el video.");
        }

        const safeTitle = (data.title || "video")
          .replace(/[\\/:*?"<>|]/g, "")
          .trim();

        return client.sendMessage(
          m.chat,
          {
            document: { url: link },
            mimetype: "video/mp4",
            fileName: `${safeTitle} - ${usedQuality}p.mp4`,
            caption:
              `🎬 ${data.title}\n` +
              `📺 Calidad: ${usedQuality}p\n` +
              `✅ API: SKY\n` +
              `🤖 ${BOT_NAME}`
          },
          { quoted: m }
        );
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
        `${ADONIX_API}?url=${encodeURIComponent(url)}&apikey=${ADONIX_KEY}`,
        { timeout: 60000 }
      );

      if (!res.data?.status || !res.data?.data?.url) {
        throw new Error("API inválida");
      }

      const fileUrl = res.data.data.url;
      const title = (res.data.data.title || "video")
        .replace(/[\\/:*?"<>|]/g, "")
        .trim();

      await client.sendMessage(
        m.chat,
        {
          document: { url: fileUrl },
          mimetype: "video/mp4",
          fileName: `${title}.mp4`,
          caption:
            `🎬 ${res.data.data.title}\n` +
            `✅ API: ADONIX\n` +
            `🤖 ${BOT_NAME}`
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("YTDOC ERROR:", err.response?.data || err.message);
      m.reply("❌ Error al descargar el video.");
    }
  }
};
