const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
const API_URL = "https://api-sky.ultraplus.click/youtube-mp4/resolve";

// calidades permitidas en orden
const QUALITIES = ["144", "240", "360", "480", "720", "1080"];

module.exports = {
  command: ["ytq"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      const quality = args[0];
      const cache = global.ytCache?.[m.sender];

      // 🔐 Validaciones
      if (!cache) return;
      if (!quality || !QUALITIES.includes(quality)) return;

      await m.reply(`⬇️ Descargando *${quality}p*...`);

      // ⏱️ timeout alto (45s)
      const res = await axios.post(
        API_URL,
        {
          url: cache.url,
          type: "video",
          quality
        },
        {
          headers: { apikey: API_KEY },
          timeout: 45000 // 🔥 CLAVE
        }
      );

      const link = res.data?.result?.media?.direct;

      if (!link) throw new Error("NO_LINK");

      await client.sendMessage(
        m.chat,
        {
          video: { url: link },
          mimetype: "video/mp4",
          caption: `🎬 ${res.data.result.title}\n📺 Calidad: ${quality}p`
        },
        { quoted: m }
      );

      // limpiar cache
      delete global.ytCache[m.sender];

    } catch (err) {
      console.error("YTQ ERROR:", err.message);

      // ⚠️ fallback automático
      const nextQuality = getFallback(args[0]);

      if (nextQuality) {
        return client.sendMessage(m.chat, {
          text: `⚠️ *${args[0]}p falló*\n🔁 Probando automáticamente *${nextQuality}p*...`
        }, { quoted: m }).then(() => {
          client.emit("message", {
            key: m.key,
            message: { conversation: `.ytq ${nextQuality}` },
            sender: m.sender
          });
        });
      }

      m.reply("❌ No se pudo descargar el video en ninguna calidad.");
      delete global.ytCache[m.sender];
    }
  }
};

// 🔁 fallback automático
function getFallback(q) {
  const order = ["1080", "720", "480", "360", "240", "144"];
  const i = order.indexOf(q);
  return i >= 0 ? order[i + 1] : null;
}

