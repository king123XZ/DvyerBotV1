const axios = require("axios");
const yts = require("yt-search");

const API_KEY = "AdonixKeythtnjs6661";

module.exports = {
  command: ["ytmp3"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      if (!args.length) {
        return m.reply("❌ Ingresa un enlace o nombre del video.");
      }

      await m.reply("⏳ Descargando audio MP3...");

      let videoUrl = args.join(" ");

      // 🔎 Buscar si no es link
      if (!videoUrl.startsWith("http")) {
        const search = await yts(videoUrl);
        if (!search.videos.length) {
          return m.reply("❌ No se encontraron resultados.");
        }
        videoUrl = search.videos[0].url;
      }

      // 🎧 API ADONIX + KEY
      const apiUrl =
        `https://api-adonix.ultraplus.click/download/ytaudio` +
        `?url=${encodeURIComponent(videoUrl)}` +
        `&apikey=${API_KEY}`;

      const { data } = await axios.get(apiUrl);

      if (!data.status || !data.data?.url) {
        return m.reply("❌ Error al obtener el audio.");
      }

      const title = data.data.title
        .replace(/[\\/:*?"<>|]/g, "")
        .slice(0, 70);

      // ⬇️ Descargar MP3
      const audio = await axios.get(data.data.url, {
        responseType: "arraybuffer",
        timeout: 120000
      });

      // 🎵 Enviar como AUDIO NORMAL
      await client.sendMessage(
        m.chat,
        {
          audio: Buffer.from(audio.data),
          mimetype: "audio/mpeg",
          fileName: title.endsWith(".mp3") ? title : `${title}.mp3`
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("YTMP3 AUDIO ERROR:", err);
      m.reply("❌ Error al descargar el audio.");
    }
  }
};

