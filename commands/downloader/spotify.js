const axios = require("axios");

const API_URL = "https://api-adonix.ultraplus.click/download/spotify";
const API_KEY = "dvyer";

module.exports = {
  command: ["spotify", "sp"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      if (!args.length) {
        return m.reply(
          "📌 Usa:\n.spotify nombre de la canción\n\nEjemplo:\n.spotify del mar ozuna"
        );
      }

      const query = args.join(" ");

      await m.reply("⏳ Buscando y descargando en Spotify...");

      const res = await axios.get(API_URL, {
        params: {
          q: query,          // ✅ CLAVE CORRECTA
          apikey: API_KEY
        },
        timeout: 60000
      });

      if (!res.data?.status || !res.data?.downloadUrl || !res.data?.song) {
        console.log("RESPUESTA ADONIX:", res.data);
        return m.reply("❌ No se pudo obtener la canción.");
      }

      const song = res.data.song;
      const audioUrl = res.data.downloadUrl;

      const title = song.title || "Spotify Audio";
      const artist = song.artist || "Desconocido";
      const duration = song.duration || "--:--";

      const caption =
        `🎵 *Spotify*\n` +
        `🎧 ${title}\n` +
        `👤 ${artist}\n` +
        `⏱️ ${duration}`;

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
      console.error("SPOTIFY ERROR:", err.response?.data || err.message);
      m.reply("❌ Error al descargar la canción.");
    }
  }
};
