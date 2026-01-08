const axios = require("axios");

// ☁️ SKY
const SKY_RESOLVE = "https://api-sky.ultraplus.click/youtube-mp4/resolve";
const SKY_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";

// 🌍 ADONIX
const ADONIX_API = "https://api-adonix.ultraplus.click/download/ytvideo";
const ADONIX_KEY = "dvyer";

// 🤖 Bot
const BOT_NAME = "KILLUA-BOT v1.00";

// SKY calidad fija para documentos
const SKY_QUALITY = "360";

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function getSkyVideo(url) {
  let link, data;

  for (let i = 0; i < 20; i++) { // ~60s máx
    try {
      const res = await axios.post(
        SKY_RESOLVE,
        { url, type: "video", quality: SKY_QUALITY },
        { headers: { apikey: SKY_KEY }, timeout: 30000 }
      );

      data = res.data?.result;
      link = data?.media?.direct;
      if (link) break;
    } catch {}

    await sleep(3000);
  }

  if (!link) throw new Error("SKY_NOT_READY");

  return {
    title: data.title,
    url: link
  };
}

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
      // ☁️ SKY (set-host sky)
      // ======================
      if (global.hosting === "sky") {
        await m.reply(
          `⏳ *Descargando video...*\n` +
          `📺 Calidad: 360p\n` +
          `☁️ API: SKY\n` +
          `🤖 ${BOT_NAME}`
        );

        const video = await getSkyVideo(url);
        const safeTitle = video.title.replace(/[\\/:*?"<>|]/g, "");

        return client.sendMessage(
          m.chat,
          {
            document: { url: video.url },
            mimetype: "video/mp4",
            fileName: `${safeTitle} - 360p.mp4`,
            caption:
              `🎬 ${video.title}\n` +
              `📄 Documento MP4\n` +
              `☁️ SKY\n` +
              `🤖 ${BOT_NAME}`
          },
          { quoted: m }
        );
      }

      // ======================
      // 🌍 ADONIX (otro host)
      // ======================
      await m.reply(
        `⏳ *Descargando video...*\n` +
        `📺 Calidad predeterminada\n` +
        `🌍 API: ADONIX\n` +
        `🤖 ${BOT_NAME}`
      );

      const res = await axios.get(
        `${ADONIX_API}?url=${encodeURIComponent(url)}&apikey=${ADONIX_KEY}`,
        { timeout: 60000 }
      );

      if (!res.data?.status || !res.data?.data?.url) {
        throw new Error("ADONIX_FAIL");
      }

      const title = (res.data.data.title || "video")
        .replace(/[\\/:*?"<>|]/g, "");

      await client.sendMessage(
        m.chat,
        {
          document: { url: res.data.data.url },
          mimetype: "video/mp4",
          fileName: `${title}.mp4`,
          caption:
            `🎬 ${res.data.data.title}\n` +
            `📄 Documento MP4\n` +
            `🌍 ADONIX\n` +
            `🤖 ${BOT_NAME}`
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("YTDOC ERROR:", err.message);
      m.reply(
        "❌ No se pudo descargar el video.\n" +
        "⏳ Intenta nuevamente más tarde."
      );
    }
  }
};

