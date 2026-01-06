const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
const API_URL = "https://api-sky.ultraplus.click/youtube-mp4/resolve";

// solo calidades soportadas por la API
const QUALITIES = ["144", "240", "360"];

module.exports = {
  command: ["ytq"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      const quality = args[0] || "360"; // default 360p
      const cache = global.ytCache?.[m.sender];

      if (!cache) return m.reply("⚠️ Primero usa el comando de búsqueda de YouTube.");
      if (!QUALITIES.includes(quality))
        return m.reply(`⚠️ Debes indicar una calidad válida: ${QUALITIES.join(", ")}`);

      await m.reply(`⬇️ Descargando *${quality}p*...`);

      const res = await axios.post(
        API_URL,
        {
          url: cache.url,
          type: "video",
          quality
        },
        {
          headers: { apikey: API_KEY },
          timeout: 45000
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

      delete global.ytCache[m.sender];

    } catch (err) {
      console.error("YTQ ERROR:", err.message);

      const nextQuality = getFallback(args[0]);
      if (nextQuality) {
        return m.reply(`⚠️ *${args[0]}p falló*\n🔁 Probando automáticamente *${nextQuality}p*...`)
          .then(() => module.exports.run(client, m, [nextQuality]));
      }

      m.reply("❌ No se pudo descargar el video en ninguna calidad.");
      delete global.ytCache[m.sender];
    }
  }
};

// fallback descendente solo hasta 144p
function getFallback(q) {
  const order = ["360", "240", "144"];
  const i = order.indexOf(q);
  return i >= 0 && i + 1 < order.length ? order[i + 1] : null;
}


