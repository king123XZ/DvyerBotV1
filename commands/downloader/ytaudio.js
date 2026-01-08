const axios = require("axios");
const yts = require("yt-search");

// 🔑 KEYS
const SKY_API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
const ADONIX_API_KEY = "AdonixKeythtnjs6661";

// 🌐 ENDPOINTS
const SKY_API_URL = "https://api-sky.ultraplus.click/youtube-mp3";
const ADONIX_API_URL = "https://api-adonix.ultraplus.click/download/ytaudio";

module.exports = {
  command: ["ytaudio"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      if (!args.length) {
        return m.reply("❌ Ingresa un enlace o nombre del video.");
      }

      await m.reply(
        "⏳ Descargando...\n" +
        "📢 Sigue el canal KILLUA-BOT:\n" +
        "https://whatsapp.com/channel/0029VaH4xpUBPzjendcoBI2c"
      );

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

      // 🌐 SELECCIÓN DE API SEGÚN HOSTING
      if (global.hosting === "sky") {
        // ☁️ SKY API
        const { data } = await axios.post(
          SKY_API_URL,
          { url: videoUrl },
          {
            headers: { apikey: SKY_API_KEY },
            timeout: 60000
          }
        );

        if (!data || !data.status) {
          return m.reply("❌ Error con la API SKY.");
        }

        audioUrl = data.result?.media?.audio;
        title = data.result?.title || title;

      } else {
        // 🌍 API NORMAL (ADONIX)
        const { data } = await axios.get(
          `${ADONIX_API_URL}?url=${encodeURIComponent(videoUrl)}&apikey=${ADONIX_API_KEY}`,
          { timeout: 60000 }
        );

        if (!data || !data.status || !data.data?.url) {
          return m.reply("❌ Error con la API normal.");
        }

        audioUrl = data.data.url;
        title = data.data.title || title;
      }

      if (!audioUrl) {
        return m.reply("❌ Audio no disponible.");
      }

      // 🧼 Limpiar título
      title = title
        .replace(/[\\/:*?"<>|]/g, "")
        .trim()
        .slice(0, 60);

      // 🎧 INTENTO 1: AUDIO NORMAL
      try {
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
        // 📄 FALLBACK: DOCUMENTO
        await client.sendMessage(
          m.chat,
          {
            document: { url: audioUrl },
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
