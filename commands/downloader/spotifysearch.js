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
  description: "Buscar canciones en Spotify",

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

      const top = results.slice(0, 5);

      for (let i = 0; i < top.length; i++) {
        const song = top[i];

        const caption = `🎵 *${song.title}*
━━━━━━━━━━━━━━
👤 Artista: ${song.artists}
💿 Álbum: ${song.album}
⏱ Duración: ${msToTime(song.duration_ms)}

🔗 ${song.spotify_url}
━━━━━━━━━━━━━━`;

        await client.sendMessage(
          m.chat,
          {
            image: { url: song.cover },
            caption
          },
          { quoted: m }
        );
      }

    } catch (err) {
      console.error("SPOTIFY ERROR:", err.response?.data || err);
      m.reply("❌ Error al buscar en Spotify.");
    }
  }
};

