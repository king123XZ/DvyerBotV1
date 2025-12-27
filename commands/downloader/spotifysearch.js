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

      const cards = results.slice(0, 5).map((song, i) => ({
        header: {
          title: song.title,
          subtitle: song.artists,
          imageMessage: {
            image: { url: song.cover }
          }
        },
        body: {
          text:
`💿 Álbum: ${song.album}
⏱ Duración: ${msToTime(song.duration_ms)}`
        },
        footer: {
          text: "Spotify Search"
        },
        nativeFlowMessage: {
          buttons: [
            {
              name: "cta_url",
              buttonParamsJson: JSON.stringify({
                display_text: "🔗 Abrir en Spotify",
                url: song.spotify_url
              })
            }
          ]
        }
      }));

      const msg = {
        interactiveMessage: {
          header: {
            title: "🎵 Resultados de Spotify",
            subtitle: query,
            hasMediaAttachment: false
          },
          body: {
            text: "Desliza para ver las canciones disponibles 👇"
          },
          footer: {
            text: "YerTX2 BOT"
          },
          carouselMessage: {
            cards
          }
        }
      };

      await client.relayMessage(m.chat, msg, {});

    } catch (err) {
      console.error("SPOTIFY CARRUSEL ERROR:", err.response?.data || err);
      m.reply("❌ Error al mostrar el carrusel de Spotify.");
    }
  }
};

