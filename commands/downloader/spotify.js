const axios = require("axios");

const API_URL = "https://api-adonix.ultraplus.click/download/spotify";
const API_KEY = "dvyer";

module.exports = {
  command: ["spotify", "sp"],
  categoria: "descarga",
  description: "Descarga  audio de spotify",

  run: async (client, m, args) => {
    try {
      if (!args.length) {
        return client.reply(
          m.chat,
          "📌 Usa:\n.spotify nombre de la canción\n\nEjemplo:\n.spotify del mar ozuna",
          m,
          global.channelInfo
        );
      }

      const query = args.join(" ");

      // ⏳ Mensaje de búsqueda y descarga
      await client.reply(
        m.chat,
        "⏳ Buscando y descargando en Spotify...",
        m,
        global.channelInfo
      );

      const res = await axios.get(API_URL, {
        params: {
          q: query,          // ✅ CLAVE CORRECTA
          apikey: API_KEY
        },
        timeout: 60000
      });

      if (!res.data?.status || !res.data?.downloadUrl || !res.data?.song) {
        console.log("RESPUESTA ADONIX:", res.data);
        return client.reply(
          m.chat,
          "❌ No se pudo obtener la canción.",
          m,
          global.channelInfo
        );
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

      // 🎧 Enviar audio usando channelInfo
      await client.sendMessage(
        m.chat,
        {
          audio: { url: audioUrl },
          mimetype: "audio/mpeg",
          fileName: `${title}.mp3`,
          caption
        },
        { quoted: m, ...global.channelInfo }
      );

    } catch (err) {
      console.error("SPOTIFY ERROR:", err.response?.data || err.message);
      await client.reply(
        m.chat,
        "❌ Error al descargar la canción.",
        m,
        global.channelInfo
      );
    }
  }
};
