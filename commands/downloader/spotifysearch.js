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
      await m.reply("🎧 Buscando en Spotify...");

      const res = await axios.post(
        "https://api-sky.ultraplus.click/search/spotify",
        { query },
        { headers: { apikey: API_KEY } }
      );

      const song = res.data?.data?.results?.[0];
      if (!song) return m.reply("❌ No se encontró ningún resultado.");

      const caption = `
🎵 *${song.title}*
👤 ${song.artists}
💿 ${song.album}
⏱ ${msToTime(song.duration_ms)}

👑 *Creador: DevYer*
      `.trim();

      await client.sendMessage(
        m.chat,
        {
          image: { url: song.cover },
          caption,
          buttons: [
            {
              buttonId: `.spdl ${song.spotify_url}`,
              buttonText: { displayText: "⬇️ Descargar" },
              type: 1
            }
          ],
          footer: "Spotify Downloader • DevYer",
          headerType: 4
        },
        { quoted: m }
      );

    } catch (e) {
      console.error("SPOTIFY ERROR:", e.response?.data || e);
      m.reply("❌ Error al buscar en Spotify.");
    }
  }
};
