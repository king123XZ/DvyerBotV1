const axios = require("axios");

// 🔵 SKY
const SKY_REGISTER = "https://api-sky.ultraplus.click/youtube-mp4";
const SKY_RESOLVE  = "https://api-sky.ultraplus.click/youtube-mp4/resolve";
const SKY_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";

// 🟢 ADONIX
const ADONIX_API = "https://api-adonix.ultraplus.click/download/ytvideo";
const ADONIX_KEY = "dvyer";

// 🤖 Bot
const BOT_NAME = "KILLUA-BOT v1.00";

// SKY qualities
const SKY_QUALITIES = ["360", "240", "144"];

if (!global.ytdocCache) global.ytdocCache = {};

module.exports = {
  command: ["ytdoc"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      // ======================
      // CLICK BOTÓN SKY
      // ======================
      if (args.length === 2 && SKY_QUALITIES.includes(args[1])) {
        const quality = args[1];
        const cache = global.ytdocCache[m.sender];
        if (!cache?.url) return m.reply("❌ El enlace expiró. Usa .ytdoc otra vez.");

        await m.reply(
          `⏳ *Descargando video...*\n` +
          `📺 Calidad: ${quality}p\n` +
          `✅ API: SKY\n` +
          `🤖 ${BOT_NAME}`
        );

        // 1️⃣ REGISTRAR
        await axios.post(
          SKY_REGISTER,
          { url: cache.url },
          { headers: { apikey: SKY_KEY }, timeout: 30000 }
        );

        // pequeña espera
        await new Promise(r => setTimeout(r, 2000));

        // 2️⃣ RESOLVER
        const res = await axios.post(
          SKY_RESOLVE,
          { url: cache.url, type: "video", quality },
          { headers: { apikey: SKY_KEY }, timeout: 30000 }
        );

        const data = res.data?.result;
        const link = data?.media?.direct;
        if (!link) throw new Error("NO_LINK");

        const safeTitle = (data.title || "video")
          .replace(/[\\/:*?"<>|]/g, "")
          .trim();

        await client.sendMessage(
          m.chat,
          {
            document: { url: link },
            mimetype: "video/mp4",
            fileName: `${safeTitle} - ${quality}p.mp4`,
            caption:
              `🎬 ${data.title}\n` +
              `📺 Calidad: ${quality}p\n` +
              `✅ API: SKY\n` +
              `🤖 ${BOT_NAME}`
          },
          { quoted: m }
        );

        delete global.ytdocCache[m.sender];
        return;
      }

      // ======================
      // COMANDO NORMAL
      // ======================
      const url = args[0];
      if (!url || !url.startsWith("http")) {
        return m.reply("❌ Usa:\n.ytdoc <link de YouTube>");
      }

      // ======================
      // ☁️ SKY (BOTONES)
      // ======================
      if (global.hosting === "sky") {
        global.ytdocCache[m.sender] = { url };

        const buttons = SKY_QUALITIES.map(q => ({
          buttonId: `.ytdoc ${url} ${q}`,
          buttonText: { displayText: `🎬 ${q}p` },
          type: 1
        }));

        return client.sendMessage(
          m.chat,
          {
            text: "📥 *Selecciona la calidad del video:*",
            footer: BOT_NAME,
            buttons,
            headerType: 1
          },
          { quoted: m }
        );
      }

      // ======================
      // 🌍 ADONIX
      // ======================
      await m.reply(
        `⏳ *Descargando video...*\n` +
        `📺 Calidad predeterminada\n` +
        `✅ API: ADONIX\n` +
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
        .replace(/[\\/:*?"<>|]/g, "")
        .trim();

      await client.sendMessage(
        m.chat,
        {
          document: { url: res.data.data.url },
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
      m.reply("❌ No se pudo descargar el video.");
      delete global.ytdocCache[m.sender];
    }
  }
};

