const axios = require("axios");
const yts = require("yt-search");

module.exports = {
  command: ["ytaudio"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      if (!args.length) return m.reply("❌ Ingresa un link o nombre.");

      await m.reply("⏳ Procesando audio...");

      let videoUrl = args.join(" ");
      if (!videoUrl.startsWith("http")) {
        const search = await yts(videoUrl);
        if (!search.videos.length) return m.reply("❌ Sin resultados.");
        videoUrl = search.videos[0].url;
      }

      const { data } = await axios.post(
        "https://api-sky.ultraplus.click/youtube-mp3",
        { url: videoUrl },
        { headers: { apikey: "sk_f606dcf6-f301-4d69-b54b-505c12ebec45" } }
      );

      if (!data.status) return m.reply("❌ Error en la API.");

      const audioUrl = data.result?.media?.audio;
      const title = (data.result?.title || "audio")
        .replace(/[\\/:*?"<>|]/g, "")
        .slice(0, 50);

      if (!audioUrl) return m.reply("❌ Audio no disponible.");

      // 🎧 INTENTO 1: AUDIO STREAM
      try {
        await client.sendMessage(
          m.chat,
          {
            audio: { url: audioUrl }, // 🔥 STREAM, NO DESCARGA
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`,
          },
          { quoted: m }
        );
      } catch (e) {
        // 📄 FALLBACK: DOCUMENTO STREAM
        await client.sendMessage(
          m.chat,
          {
            document: { url: audioUrl }, // 🔥 STREAM
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`,
          },
          { quoted: m }
        );
      }

    } catch (err) {
      console.error("YTAUDIO ERROR:", err.message);
      m.reply("❌ El servidor está ocupado. Intenta de nuevo.");
    }
  }
};


