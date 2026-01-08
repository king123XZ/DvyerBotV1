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
        `📢 Sigue el canal ${BOT_NAME}:\n` +
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
      let apiUsed = "desconocida";

      // 🌐 SELECCIÓN DE API SEGÚN HOSTING
      if (global.hosting === "sky") {
        // ☁️ SKY API
        try {
          const { data } = await axios.get(SKY_API_URL, {
            params: { url: videoUrl, apikey: SKY_API_KEY },
            timeout: 60000
          });

          if (!data || !data.status) {
            return m.reply("❌ Error con la API SKY.");
          }

          audioUrl = data.result?.audio || data.result?.media?.audio;
          title = data.result?.title || title;
          apiUsed = "SKY";

        } catch (err) {
          console.error("SKY API ERROR:", err.response?.data || err.message);
          return m.reply("❌ No se pudo descargar desde SKY.");
        }

      } else {
        // 🌍 ADONIX API
        try {
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

        } catch (err) {
          console.error("ADONIX API ERROR:", err.response?.data || err.message);
          return m.reply("❌ No se pudo descargar desde ADONIX.");
        }
      }

      if (!audioUrl) {
        return m.reply("❌ Audio no disponible.");
      }

      // 🧼 Limpiar título
      title = title.replace(/[\\/:*?"<>|]/g, "").trim().slice(0, 60);

      // 🎧 Mensaje final mostrando la API usada y nombre del bot
      const caption = `🎵 *${title}*\n✅ Enviado por: *${apiUsed}*\n🤖 Bot: *${BOT_NAME}*`;

      try {
        await client.sendMessage(
          m.chat,
          {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`,
            caption
          },
          { quoted: m }
        );
      } catch (err) {
        await client.sendMessage(
          m.chat,
          {
            document: { url: audioUrl },
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`,
            caption
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

