const axios = require("axios");
const yts = require("yt-search");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
const API_URL = "https://api-sky.ultraplus.click/youtube-mp3";

module.exports = {
  command: ["ytaudio"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      if (!args.length) {
        return m.reply("❌ Ingresa un enlace o nombre del video.");
      }

      await m.reply("⏳ Descargando...Sigue el canal  KILLUA-BOT en WhatsApp: https://whatsapp.com/channel/0029VaH4xpUBPzjendcoBI2c");

      let videoUrl = args.join(" ");

      // 🔎 Buscar si no es enlace
      if (!videoUrl.startsWith("http")) {
        const search = await yts(videoUrl);
        if (!search.videos || !search.videos.length) {
          return m.reply("❌ No se encontraron resultados.");
        }
        videoUrl = search.videos[0].url;
      }

      // 🎧 Solicitar audio
      const { data } = await axios.post(
        API_URL,
        { url: videoUrl },
        {
          headers: { apikey: API_KEY },
          timeout: 60000
        }
      );

      if (!data || !data.status) {
        return m.reply("❌ No se pudo procesar el audio.");
      }

      const audioUrl = data.result?.media?.audio;
      if (!audioUrl) {
        return m.reply("❌ Audio no disponible.");
      }

      // 🧼 Limpiar título
      const title = (data.result?.title || "audio")
        .replace(/[\\/:*?"<>|]/g, "")
        .trim()
        .slice(0, 60);

      // 🎧 INTENTO 1: AUDIO STREAM
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
        // 📄 FALLBACK: DOCUMENTO STREAM
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