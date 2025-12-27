const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  command: ["spotify", "spotifysearch"],
  category: "downloader",
  description: "Buscar canciones en Spotify",

  run: async (client, m, args) => {
    try {
      if (!args.length) {
        return m.reply("❌ Ejemplo:\n.spotify bad bunny");
      }

      const query = args.join(" ");
      await m.reply(`🎧 Buscando en Spotify: *${query}*`);

      const r = await axios.post(
        "https://api-sky.ultraplus.click/search/spotify",
        { query },
        {
          headers: {
            apikey: API_KEY
          }
        }
      );

      const items = r.data?.result?.items;

      if (!Array.isArray(items) || items.length === 0) {
        return m.reply("❌ No se encontraron resultados en Spotify.");
      }

      const results = items.slice(0, 5);

      for (let i = 0; i < results.length; i++) {
        const s = results[i];

        if (!s || !s.url) continue;

        const caption = `🎵 *Resultado ${i + 1}/5*
━━━━━━━━━━━━━━
🎧 Título: ${s.title || "Desconocido"}
👤 Artista: ${s.artist || "?"}
💿 Álbum: ${s.album || "?"}
⏱ Duración: ${s.duration || "?"}

🔗 ${s.url}
━━━━━━━━━━━━━━`;

        // Si hay imagen, la enviamos
        if (s.thumbnail) {
          await client.sendMessage(
            m.chat,
            {
              image: { url: s.thumbnail },
              caption,
              footer: "YerTX Bot",
              headerType: 4
            },
            { quoted: m }
          );
        } else {
          // Si no hay imagen, texto simple
          await client.sendMessage(
            m.chat,
            { text: caption },
            { quoted: m }
          );
        }

        await sleep(700); // evita flood
      }

    } catch (err) {
      console.error("❌ SPOTIFY SEARCH ERROR:", err.response?.data || err);
      m.reply("❌ Error al buscar en Spotify.");
    }
  }
};
