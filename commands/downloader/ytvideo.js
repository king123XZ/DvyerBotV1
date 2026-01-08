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

// Tu canal de WhatsApp
const MY_CHANNEL = "https://whatsapp.com/channel/0029VaH4xpUBPzjendcoBI2c";

// Tamaño máximo para enviar como video normal
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB
const UPLOAD_SPEED = 1 * 1024 * 1024; // 1 MB/s

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
        // Si no hay calidad elegida, mostrar botones
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
        let success = false;

        // Registrar video
        await axios.post(SKY_API_REGISTER, { url: cache.url }, {
          headers: { apikey: SKY_KEY, "Content-Type": "application/json" }
        });

        // Intentar calidades según peso
        for (const quality of [chosenQuality, "360"]) {
          try {
            const res = await axios.post(SKY_API_RESOLVE, { url: cache.url, type: "video", quality }, {
              headers: { apikey: SKY_KEY, "Content-Type": "application/json" },
              timeout: 60000
            });

            const tmpUrl = res.data?.result?.media?.direct;
            const tmpTitle = res.data.result?.title || title;
            let fileSize = 0;

            try {
              const head = await axios.head(tmpUrl);
              fileSize = parseInt(head.headers["content-length"]) || 0;
            } catch {}

            if (fileSize <= MAX_VIDEO_SIZE || quality === "360") {
              videoUrl = tmpUrl;
              title = tmpTitle;
              finalQuality = quality;
              success = true;
              break;
            }
          } catch (err) {
            console.warn(`Error con ${quality}p:`, err.message);
          }
        }

        if (!success) {
          // última opción enviar 360p como documento
          const res = await axios.post(SKY_API_RESOLVE, { url: cache.url, type: "video", quality: "360" }, {
            headers: { apikey: SKY_KEY, "Content-Type": "application/json" },
            timeout: 60000
          });

          videoUrl = res.data?.result?.media?.direct;
          title = res.data.result?.title || title;
          finalQuality = "360";
        }

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

      // Tamaño final
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
      let infoMessage = `⏳ Descargando...\n🎬 *${title}*\n✅ API: *${apiUsed}*\n📺 Calidad: ${finalQuality}\n🤖 Bot: *${BOT_NAME}*\n📦 Tamaño aproximado: ${(fileSize / (1024*1024)).toFixed(2)} MB\n⏱ Tiempo estimado: ${estimatedTime}`;
      if (fileSize > MAX_VIDEO_SIZE) infoMessage += `\n⚠️ El archivo es grande y se enviará como documento.`;

      await client.sendMessage(m.chat, { text: infoMessage }, { quoted: m });

      // Enviar video o documento según tamaño
      if (fileSize > MAX_VIDEO_SIZE) {
        await client.sendMessage(
          m.chat,
          { document: { url: videoUrl }, mimetype: "video/mp4", fileName: `${title}.mp4` },
          { quoted: m }
        );
      } else {
        await client.sendMessage(
          m.chat,
          { video: { url: videoUrl }, mimetype: "video/mp4", fileName: `${title}.mp4` },
          { quoted: m }
        );
      }

    } catch (err) {
      console.error("YTVIDEO ERROR:", err.response?.data || err.message);
      m.reply("❌ Error al descargar el video.");
    }
  }
};

