const axios = require("axios");
const yts = require("yt-search");

module.exports = {
  command: ["yt1"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      if (!args.length) {
        return m.reply("❌ Ingresa un enlace o nombre del video.");
      }

      await m.reply(
        "⏳ Descargando audio...\n📢 Sigue el canal KILLUA-BOT:\nhttps://whatsapp.com/channel/0029VaH4xpUBPzjendcoBI2c"
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

      // 🎧 Solicitud a gawrgura API
      const apiUrl = `https://gawrgura-api.onrender.com/download/ytmp3?url=${encodeURIComponent(videoUrl)}`;
      const { data } = await axios.get(apiUrl, { timeout: 60000 });

      if (!data || !data.status) {
        return m.reply("❌ No se pudo procesar el audio.");
      }

      const audioUrl = data.result?.download;
      if (!audioUrl) {
        return m.reply("❌ Audio no disponible.");
      }

      // 🧼 Limpiar título
      const title = (data.result?.title || "audio")
        .replace(/[\\/:*?"<>|]/g, "")
        .trim()
        .slice(0, 60);

      // 🎧 INTENTO 1: AUDIO
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


