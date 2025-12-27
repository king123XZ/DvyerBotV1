const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";

const msToTime = (ms) => {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec < 10 ? "0" : ""}${sec}`;
};

module.exports = {
  command: ["spotify", "spot"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      if (!args.length) {
        return m.reply("❌ Usa:\n.spotify ozuna una flor");
      }

      const query = args.join(" ");
      await m.reply(`🎧 Buscando en Spotify:\n*${query}*`);

      const res = await axios.post(
        "https://api-sky.ultraplus.click/search/spotify",
        { query },
        { headers: { apikey: API_KEY } }
      );

      const results = res.data?.data?.results;
      if (!results || !results.length) {
        return m.reply("❌ No se encontraron resultados.");
      }

      const rows = results.slice(0, 10).map((song, i) => ({
        title: `${i + 1}. ${song.title}`,
        description: `${song.artists} • ${msToTime(song.duration_ms)}`,
        rowId: `.spotlink ${song.spotify_url}`
      }));

      const listMsg = {
        text: "🎵 *Resultados de Spotify*",
        footer: "Selecciona una canción",
        title: "Spotify Search",
        buttonText: "📂 Ver canciones",
        sections: [
          {
            title: "Resultados",
            rows
          }
        ]
      };

      await client.sendMessage(m.chat, listMsg, { quoted: m });

    } catch (err) {
      console.error("SPOTIFY LIST ERROR:", err.response?.data || err);
      m.reply("❌ Error al mostrar la lista de Spotify.");
    }
  }
};


