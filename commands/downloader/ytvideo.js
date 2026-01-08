const axios = require("axios");

const ADONIX_API = "https://api-adonix.ultraplus.click/download/ytvideo";
const ADONIX_KEY = "AdonixKeythtnjs6661";

module.exports = {
  command: ["ytvideo"],
  category: "downloader",

  run: async (client, m, args) => {
    const url = args[0];

    if (!url || !url.startsWith("http")) {
      return m.reply("❌ Enlace de YouTube no válido.");
    }

    // 🏠 SKY HOST → MOSTRAR BOTONES
    if (global.botHost === "sky") {
      global.ytCache = global.ytCache || {};
      global.ytCache[m.sender] = {
        url,
        owner: m.sender,
        time: Date.now()
      };

      const buttons = [
        { buttonId: ".ytq 144", buttonText: { displayText: "📱 144p" }, type: 1 },
        { buttonId: ".ytq 240", buttonText: { displayText: "📱 240p" }, type: 1 },
        { buttonId: ".ytq 360", buttonText: { displayText: "🎬 360p" }, type: 1 }
      ];

      return client.sendMessage(
        m.chat,
        {
          text: "📥 *Selecciona la calidad del video:*",
          footer: "Killua-Bot • SkyHosting",
          buttons,
          headerType: 1
        },
        { quoted: m }
      );
    }

    // 🌍 OTRO HOST → DESCARGA DIRECTA
    try {
      await m.reply("⬇️ Descargando video (calidad disponible)...");

      const res = await axios.get(
        `${ADONIX_API}?url=${encodeURIComponent(url)}&apikey=${ADONIX_KEY}`,
        { timeout: 60000 }
      );

      if (!res.data?.status || !res.data?.data?.url) {
        throw new Error("API inválida");
      }

      await client.sendMessage(
        m.chat,
        {
          video: { url: res.data.data.url },
          mimetype: "video/mp4",
          fileName: res.data.data.title || "video.mp4"
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("YTVIDEO ADONIX ERROR:", err);
      m.reply("❌ Error al descargar el video.");
    }
  }
};
