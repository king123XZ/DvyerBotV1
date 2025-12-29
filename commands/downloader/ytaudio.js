const axios = require("axios");
const yts = require("yt-search");

module.exports = {
  command: ["ytaudio"],
  description: "Descarga audio MP3 de YouTube",
  category: "downloader",
  use: "ytaudio <link o nombre>",

  run: async (client, m, args) => {
    try {
      if (!args.length) return m.reply("❌ Ingresa un link o nombre de YouTube.");

      await m.reply("⏳ Procesando audio...");

      let videoUrl = args.join(" ");

      if (!videoUrl.startsWith("http")) {
        const search = await yts(videoUrl);
        if (!search.videos.length) return m.reply("❌ No se encontraron resultados.");
        videoUrl = search.videos[0].url;
      }

      const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";

      // 📡 Obtener audio de la API
      const { data } = await axios.post(
        "https://api-sky.ultraplus.click/youtube-mp3",
        { url: videoUrl },
        { headers: { "Content-Type": "application/json", apikey: API_KEY } }
      );

      if (!data.status) return m.reply("❌ La API no pudo procesar el audio.");

      const result = data.result;
      const audioUrl = result?.media?.audio;
      if (!audioUrl) return m.reply("❌ No se pudo obtener el audio.");

      await client.sendMessage(
        m.chat,
        {
          audio: { url: audioUrl },
          mimetype: "audio/mpeg",
          fileName: `${result.title}.mp3`,
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("YTAUDIO ERROR:", err.response?.data || err.message);
      m.reply("❌ Ocurrió un error al descargar el audio.");
    }
  }
};

