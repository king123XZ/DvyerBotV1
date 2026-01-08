const axios = require("axios");
const yts = require("yt-search");

// 🔑 KEYS
const SKY_API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
const ADONIX_API_KEY = "dvyer";

// 🌐 ENDPOINTS
const SKY_API_URL = "https://api-sky.ultraplus.click/youtube-mp3";
const ADONIX_API_URL = "https://api-adonix.ultraplus.click/download/ytaudio";

// 🤖 Bot
const BOT_NAME = "KILLUA-BOT v1.00";

module.exports = {
  command: ["ytaudio"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      if (!args.length) {
        return m.reply("❌ Ingresa un enlace o nombre del video.");
      }

      let videoUrl = args.join(" ");

      // 🔎 Buscar si no es enlace
      if (!videoUrl.startsWith("http")) {
        const search = await yts(videoUrl);
        if (!search.videos || !search.videos.length) {
          return m.reply("❌ No se encontraron resultados.");
        }
        videoUrl = search.videos[0].url;
      }

      let audioUrl;
      let title = "audio";
      let apiUsed = "DESCONOCIDA";

      // ======================
      // SKY
      // ======================
      if (global.hosting === "sky") {
        const { data } = await axios.post(
          SKY_API_URL,
          { url: videoUrl },
          { headers: { apikey: SKY_API_KEY }, timeout: 60000 }
        );

        if (!data || !data.status) {
          return m.reply("❌ Error con la API SKY.");
        }

        audioUrl = data.result?.media?.audio;
        title = data.result?.title || title;
        apiUsed = "SKY";
      }

      // ======================
      // ADONIX
      // ======================
      else {
        const { data } = await axios.get(ADONIX_API_URL, {
          params: { url: videoUrl, apikey: ADONIX_API_KEY },
          timeout: 60000
        });

        if (!data || !data.status || !data.data?.url) {
          return m.reply("❌ Error con la API ADONIX.");
        }

        audioUrl = data.data.url;
        title = data.data.title || title;
        apiUsed = "ADONIX";
      }

      if (!audioUrl) {
        return m.reply("❌ Audio no disponible.");
      }

      // 🧼 Limpiar título
      title = title.replace(/[\\/:*?"<>|]/g, "").trim().slice(0, 60);

      // ⚡ MENSAJE INMEDIATO (RÁPIDO)
      await client.sendMessage(
        m.chat,
        {
          text:
            `⏳ *Descargando audio...*\n` +
            `🎵 *${title}*\n` +
            `✅ API: *${apiUsed}*\n` +
            `🤖 Bot: *${BOT_NAME}*`
        },
        { quoted: m }
      );

      // 🎧 ENVIAR AUDIO NORMAL
      await client.sendMessage(
        m.chat,
        {
          audio: { url: audioUrl },
          mimetype: "audio/mpeg",
          fileName: `${title}.mp3`
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("YTAUDIO ERROR:", err.response?.data || err.message);
      m.reply("❌ Error al descargar el audio.");
    }
  }
};

