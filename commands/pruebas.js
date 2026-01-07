const axios = require("axios");
const yts = require("yt-search");

module.exports = {
  command: ["ytmp3"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      if (!args.length) {
        return m.reply("❌ Ingresa un enlace o nombre del video.");
      }

      await m.reply("⏳ Descargando audio...");

      let videoUrl = args.join(" ");

      // 🔎 Buscar si no es link
      let title = "audio";
      if (!videoUrl.startsWith("http")) {
        const search = await yts(videoUrl);
        if (!search.videos.length) {
          return m.reply("❌ No se encontraron resultados.");
        }
        videoUrl = search.videos[0].url;
        title = search.videos[0].title;
      }

      // 🧼 Limpiar título
      title = title
        .replace(/[\\/:*?"<>|]/g, "")
        .slice(0, 60);

      // 🎧 Llamar API
      const apiUrl = `https://gawrgura-api.onrender.com/download/ytmp3?url=${encodeURIComponent(videoUrl)}`;
      const { data } = await axios.get(apiUrl, { timeout: 60000 });

      if (!data || !data.status || !data.result) {
        return m.reply("❌ Error al obtener el audio.");
      }

      const audioUrl = data.result; // 🔥 DIRECTO

      // 🎧 INTENTO AUDIO
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
      } catch (e) {
        // 📄 FALLBACK DOCUMENTO
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
      console.error("YTMP3 ERROR:", err);
      m.reply("❌ El servidor está ocupado, intenta más tarde.");
    }
  }
};

