const axios = require("axios");

const ADONIX_API = "https://api-adonix.ultraplus.click/download/ytvideo";
const ADONIX_KEY = "dvyer";

const SKY_API = "https://api-sky.ultraplus.click/youtube-mp4/resolve";
const SKY_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";

module.exports = {
  command: ["ytvideo"],
  category: "downloader",

  run: async (client, m, args) => {
    const url = args[0];
    const qualityArg = args[1]; // calidad seleccionada si se usa Sky

    if (!url || !url.startsWith("http")) {
      return m.reply("❌ Enlace de YouTube no válido.");
    }

    // 🏠 SKY HOST → MOSTRAR BOTONES
    if (global.botHost === "sky") {

      // Si no hay calidad seleccionada, mostrar botones
      if (!qualityArg) {
        global.ytCache = global.ytCache || {};
        global.ytCache[m.sender] = { url, owner: m.sender, time: Date.now() };

        const buttons = [
          { buttonId: `.ytvideo ${url} 144`, buttonText: { displayText: "📱 144p" }, type: 1 },
          { buttonId: `.ytvideo ${url} 240`, buttonText: { displayText: "📱 240p" }, type: 1 },
          { buttonId: `.ytvideo ${url} 360`, buttonText: { displayText: "🎬 360p" }, type: 1 }
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

      // Si ya se seleccionó la calidad → descargar desde Sky
      try {
        await m.reply(`⬇️ Descargando video en ${qualityArg}p...`);

        const res = await axios.get(
          `${SKY_API}?url=${encodeURIComponent(url)}&quality=${qualityArg}&apikey=${SKY_KEY}`,
          { timeout: 60000 }
        );

        if (!res.data?.status || !res.data?.data?.url) {
          throw new Error("API de Sky inválida");
        }

        await client.sendMessage(
          m.chat,
          {
            video: { url: res.data.data.url },
            mimetype: "video/mp4",
            fileName: res.data.data.title || `video-${qualityArg}p.mp4`
          },
          { quoted: m }
        );

      } catch (err) {
        console.error("YTVIDEO SKY ERROR:", err);
        return m.reply("❌ Error al descargar el video desde Sky.");
      }

      return;
    }

    // 🌍 OTRO HOST → DESCARGA DIRECTA con Adonix
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
