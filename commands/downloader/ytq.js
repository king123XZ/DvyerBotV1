const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";

const SKY_API = "https://api-sky.ultraplus.click/youtube-mp4/resolve";
const BACKUP_API = "https://api-adonix.ultraplus.click/download/ytvideo";

// calidades permitidas
const QUALITIES = ["144", "240", "360"];

module.exports = {
  command: ["ytq"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      const quality = args[0];
      const cache = global.ytCache?.[m.sender];
      const hosting = global.hosting || "otro";

      if (!cache) return;
      if (!quality || !QUALITIES.includes(quality)) return;

      const API_URL = hosting === "sky" ? SKY_API : BACKUP_API;

      await m.reply(`⬇️ Descargando *${quality}p*...\n🌐 Hosting: *${hosting.toUpperCase()}*`);

      const res = await axios.post(
        API_URL,
        {
          url: cache.url,
          quality,
          type: "video"
        },
        {
          headers: { apikey: API_KEY },
          timeout: 45000
        }
      );

      // compatibilidad entre APIs
      const link =
        res.data?.result?.media?.direct ||
        res.data?.data?.url;

      const title =
        res.data?.result?.title ||
        res.data?.data?.title ||
        "YouTube Video";

      if (!link) throw new Error("NO_LINK");

      await client.sendMessage(
        m.chat,
        {
          video: { url: link },
          mimetype: "video/mp4",
          caption: `🎬 ${title}\n📺 Calidad: ${quality}p`
        },
        { quoted: m }
      );

      delete global.ytCache[m.sender];

    } catch (err) {
      console.error("YTQ ERROR:", err.message);

      const nextQuality = getFallback(args[0]);

      if (nextQuality) {
        await client.sendMessage(
          m.chat,
          {
            text: `⚠️ *${args[0]}p falló*\n🔁 Probando automáticamente *${nextQuality}p*...`
          },
          { quoted: m }
        );

        return client.emit("message", {
          key: m.key,
          message: { conversation: `.ytq ${nextQuality}` },
          sender: m.sender
        });
      }

      m.reply("❌ No se pudo descargar el video.");
      delete global.ytCache[m.sender];
    }
  }
};

// 🔁 fallback automático
function getFallback(q) {
  const order = ["360", "240", "144"];
  const i = order.indexOf(q);
  return i >= 0 ? order[i + 1] : null;
}

