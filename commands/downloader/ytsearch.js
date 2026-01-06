const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";

module.exports = {
  command: ["play"],
  description: "Buscar música en YouTube",
  category: "downloader",

  run: async (client, m, args) => {
    try {
      if (!args.length) {
        return m.reply("⚠️ Ingresa el nombre de la canción o artista.");
      }

      const query = args.join(" ");
      await m.reply(`⏳ Buscando: *${query}* ...`);

      // 🔍 BÚSQUEDA CON ENDPOINT NUEVO
      const r = await axios.post(
        "https://api-sky.ultraplus.click/search/youtube",
        { q: query },
        {
          headers: {
            apikey: API_KEY
          }
        }
      );

      const items = r.data?.result?.items;
      if (!items || !items.length) {
        return m.reply("❌ No se encontraron resultados.");
      }

      const video = items[0];

      const caption = `🎬 *Título:* ${video.title}
📌 *Canal:* ${video.author?.name || "YouTube"}
⏱ *Duración:* ${video.duration || "?"}
👁 *Vistas:* ${video.views?.toLocaleString?.() || "?"}
🔗 *Enlace:* ${video.url}`;

      const buttons = [
        { buttonId: `.ytaudio ${video.url}`, buttonText: { displayText: "🎵 Audio" }, type: 1 },
        { buttonId: `.ytvideo ${video.url}`, buttonText: { displayText: "🎬 Video" }, type: 1 },
        { buttonId: `.ytdoc ${video.url}`, buttonText: { displayText: "📄 Documento mp4 videos largos" }, type: 1 }
      ];

      await client.sendMessage(
        m.chat,
        {
          image: { url: video.thumbnail },
          caption,
          footer: "DevYER",
          buttons,
          headerType: 4
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("PLAY SEARCH ERROR:", err.response?.data || err.message);
      m.reply("❌ Error al buscar en YouTube.");
    }
  }
};

