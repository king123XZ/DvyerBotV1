const axios = require("axios");

// Adonix
const ADONIX_API = "https://api-adonix.ultraplus.click/download/ytvideo";
const ADONIX_KEY = "dvyer";

// Sky
const SKY_API_REGISTER = "https://api-sky.ultraplus.click/youtube-mp4";
const SKY_API_RESOLVE = "https://api-sky.ultraplus.click/youtube-mp4/resolve";
const SKY_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";

// Nombre del bot
const BOT_NAME = "KILLUA-BOT v1.00";

// Límite de tamaño para video normal
const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200 MB
const UPLOAD_SPEED = 2 * 1024 * 1024; // estimación de 2 MB/s para tiempo

// SKY calidades
const SKY_QUALITIES = ["720", "360"];

module.exports = {
  command: ["ytvideo"],
  category: "downloader",

  run: async (client, m, args) => {
    const url = args[0];
    const hosting = global.hosting || "adonix";

    if (!url || !url.startsWith("http")) return m.reply("❌ Enlace de YouTube no válido.");

    global.ytCache = global.ytCache || {};

    try {
      let videoUrl, title = "video", apiUsed = hosting === "sky" ? "SKY" : "ADONIX", finalQuality = "default";

      // ----------------------
      // SKY
      // ----------------------
      if (hosting === "sky") {
        let chosenQuality = args[1];
        if (!chosenQuality) {
          global.ytCache[m.sender] = { url };
          const buttons = SKY_QUALITIES.map(q => ({
            buttonId: `.ytvideo ${url} ${q}`,
            buttonText: { displayText: `🎬 ${q}p` },
            type: 1
          }));

          return client.sendMessage(
            m.chat,
            {
              text: "📥 *Selecciona la calidad del video:*",
              footer: `Bot: ${BOT_NAME} • API: SKY`,
              buttons,
              headerType: 1
            },
            { quoted: m }
          );
        }

        chosenQuality = SKY_QUALITIES.includes(chosenQuality) ? chosenQuality : "720";
        const cache = global.ytCache[m.sender] || { url };

        // Registrar video
        await axios.post(SKY_API_REGISTER, { url: cache.url }, {
          headers: { apikey: SKY_KEY, "Content-Type": "application/json" }
        });

        // Resolver video
        const res = await axios.post(SKY_API_RESOLVE, { url: cache.url, type: "video", quality: chosenQuality }, {
          headers: { apikey: SKY_KEY, "Content-Type": "application/json" },
          timeout: 60000
        });

        videoUrl = res.data?.result?.media?.direct;
        title = res.data.result?.title || title;
        finalQuality = chosenQuality;

        delete global.ytCache[m.sender];
      } else {
        // ----------------------
        // ADONIX
        // ----------------------
        const res = await axios.get(`${ADONIX_API}?url=${encodeURIComponent(url)}&apikey=${ADONIX_KEY}`, {
          timeout: 60000
        });
        if (!res.data?.status || !res.data?.data?.url) throw new Error("API inválida");

        videoUrl = res.data.data.url;
        title = res.data.data.title || title;
        finalQuality = res.data.data.quality || "default";
      }

      // Limpiar título
      title = title.replace(/[\\/:*?"<>|]/g, "").trim().slice(0, 60);

      // Tamaño del archivo
      let fileSize = 0;
      try {
        const head = await axios.head(videoUrl);
        fileSize = parseInt(head.headers["content-length"]) || 0;
      } catch {}

      // Tiempo estimado
      const estimatedSeconds = Math.ceil(fileSize / UPLOAD_SPEED);
      const minutes = Math.floor(estimatedSeconds / 60);
      const seconds = estimatedSeconds % 60;
      const estimatedTime = `${minutes}m ${seconds}s`;

      // Mensaje inicial
      const infoMessage = `⏳ Descargando...\n🎬 *${title}*\n✅ API: *${apiUsed}*\n📺 Calidad: ${finalQuality}\n🤖 Bot: *${BOT_NAME}*\n📦 Tamaño aproximado: ${(fileSize / (1024*1024)).toFixed(2)} MB\n⏱ Tiempo estimado: ${estimatedTime}`;

      await client.sendMessage(m.chat, { text: infoMessage }, { quoted: m });

      // Validar límite de 200 MB
      if (fileSize > MAX_VIDEO_SIZE) {
        return client.sendMessage(
          m.chat,
          { text: `❌ El video supera el límite de ${MAX_VIDEO_SIZE / (1024*1024)} MB y no se puede enviar.` },
          { quoted: m }
        );
      }

      // Enviar video normal
      await client.sendMessage(
        m.chat,
        { video: { url: videoUrl }, mimetype: "video/mp4", fileName: `${title}.mp4` },
        { quoted: m }
      );

    } catch (err) {
      console.error("YTVIDEO ERROR:", err.response?.data || err.message);
      m.reply("❌ Error al descargar el video.");
    }
  }
};
