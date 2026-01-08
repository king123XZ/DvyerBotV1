const axios = require("axios");
const yts = require("yt-search");

// 🔑 KEYS
const SKY_API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
const ADONIX_API_KEY = "dvyer";

// 🌐 ENDPOINTS
const SKY_API_URL = "https://api-sky.ultraplus.click/youtube-mp3";
const ADONIX_API_URL = "https://api-adonix.ultraplus.click/download/ytaudio";

// 📛 Nombre del bot
const BOT_NAME = "KILLUA-BOT v1.00";

// 🔹 Tamaño máximo de audio para enviar como audio normal (50 MB)
const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50 MB en bytes

// 🔹 Velocidad estimada de envío en bytes/segundo (ej. 1 MB/s)
const UPLOAD_SPEED = 1 * 1024 * 1024; // 1 MB/s

module.exports = {
  command: ["ytaudio"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      if (!args.length) return m.reply("❌ Ingresa un enlace o nombre del video.");

      let videoUrl = args.join(" ");

      // 🔎 Buscar si no es enlace
      if (!videoUrl.startsWith("http")) {
        const search = await yts(videoUrl);
        if (!search.videos || !search.videos.length) return m.reply("❌ No se encontraron resultados.");
        videoUrl = search.videos[0].url;
      }

      let audioUrl;
      let title = "audio";
      let apiUsed = "desconocida";

      // 🌐 SELECCIÓN DE API SEGÚN HOSTING
      if (global.hosting === "sky") {
        // ☁️ SKY API POST
        try {
          const { data } = await axios.post(
            SKY_API_URL,
            { url: videoUrl },
            { headers: { apikey: SKY_API_KEY }, timeout: 60000 }
          );

          console.log("SKY API DATA:", data); // para depuración

          if (!data || !data.status) return m.reply("❌ Error con la API SKY.");

          audioUrl = data.result?.media?.audio;
          title = data.result?.title || title;
          apiUsed = "SKY";

        } catch (err) {
          console.error("SKY API ERROR:", err.response?.data || err.message);
          return m.reply("❌ No se pudo descargar desde SKY.");
        }

      } else {
        // 🌍 ADONIX API GET
        try {
          const { data } = await axios.get(ADONIX_API_URL, {
            params: { url: videoUrl, apikey: ADONIX_API_KEY },
            timeout: 60000
          });

          if (!data || !data.status || !data.data?.url) return m.reply("❌ Error con la API ADONIX.");

          audioUrl = data.data.url;
          title = data.data.title || title;
          apiUsed = "ADONIX";

        } catch (err) {
          console.error("ADONIX API ERROR:", err.response?.data || err.message);
          return m.reply("❌ No se pudo descargar desde ADONIX.");
        }
      }

      if (!audioUrl) return m.reply("❌ Audio no disponible.");

      // 🧼 Limpiar título
      title = title.replace(/[\\/:*?"<>|]/g, "").trim().slice(0, 60);

      // 🔹 Obtener tamaño del archivo remoto
      let fileSize = 0;
      try {
        const head = await axios.head(audioUrl);
        fileSize = parseInt(head.headers["content-length"]) || 0;
      } catch (err) {
        console.warn("No se pudo obtener el tamaño del archivo, se enviará como audio normal.");
      }

      // 🔹 Estimación de tiempo en segundos
      const estimatedSeconds = Math.ceil(fileSize / UPLOAD_SPEED);
      const minutes = Math.floor(estimatedSeconds / 60);
      const seconds = estimatedSeconds % 60;
      const estimatedTime = `${minutes}m ${seconds}s`;

      // 🔹 Preparar mensaje informativo
      let infoMessage = `⏳ Descargando...\n🎵 *${title}*\n✅ Enviado por: *${apiUsed}*\n🤖 Bot: *${BOT_NAME}*\n`;
      if (fileSize > MAX_AUDIO_SIZE) infoMessage += `⚠️ El archivo pesa más de 50 MB, se enviará como documento.\n`;
      infoMessage += `📦 Tamaño aproximado: ${(fileSize / (1024 * 1024)).toFixed(2)} MB\n⏱ Tiempo estimado: ${estimatedTime}`;

      // 🔹 Enviar mensaje inicial
      await client.sendMessage(
        m.chat,
        { text: infoMessage },
        { quoted: m }
      );

      // 🔹 Enviar audio o documento según tamaño
      if (fileSize > MAX_AUDIO_SIZE) {
        await client.sendMessage(
          m.chat,
          {
            document: { url: audioUrl },
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`,
            caption: infoMessage
          },
          { quoted: m }
        );
      } else {
        await client.sendMessage(
          m.chat,
          {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`
          },
          { quoted: m }
        );
      }

    } catch (err) {
      console.error("YTAUDIO ERROR:", err);
      m.reply("❌ El servidor está ocupado. Intenta más tarde.");
    }
  }
};


