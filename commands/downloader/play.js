const axios = require("axios");
const yts = require("yt-search");

const SKY_API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
const SKY_SEARCH_URL = "https://api-sky.ultraplus.click/search/youtube";

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

      let video;

      // 🌐 SELECCIÓN SEGÚN HOSTING
      if (global.hosting === "sky") {
        // ☁️ SKY SEARCH
        const r = await axios.post(
          SKY_SEARCH_URL,
          { q: query },
          {
            headers: { apikey: SKY_API_KEY },
            timeout: 30000
          }
        );

        const items = r.data?.result?.items;
        if (!items || !items.length) {
          return m.reply("❌ No se encontraron resultados.");
        }

        video = items[0];

      } else {
        // 🌍 BÚSQUEDA LOCAL (yt-search)
        const search = await yts(query);
        if (!search.videos || !search.videos.length) {
          return m.reply("❌ No se encontraron resultados.");
        }

        const v = search.videos[0];
        video = {
          title: v.title,
          url: v.url,
          duration: v.timestamp,
          views: v.views,
          thumbnail: v.thumbnail,
          author: { name: v.author?.name || "YouTube" }
        };
      }

      // 🧾 MENSAJE
      const caption =
        `🎬 *Título:* ${video.title}\n` +
        `📌 *Canal:* ${video.author?.name || "YouTube"}\n` +
        `⏱ *Duración:* ${video.duration || "?"}\n` +
        `👁 *Vistas:* ${video.views?.toLocaleString?.() || "?"}\n` +
        `🔗 *Enlace:* ${video.url}`;

      const buttons = [
        { buttonId: `.ytaudio ${video.url}`, buttonText: { displayText: "🎵 Audio" }, type: 1 },
        //{ buttonId: `.ytvideo ${video.url}`, buttonText: { displayText: "🎬 Video" }, type: 1 },
        { buttonId: `.ytdoc ${video.url}`, buttonText: { displayText: "🎬 video mp4" }, type: 1 }
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
      console.error("PLAY ERROR:", err.response?.data || err.message);
      m.reply("❌ Error al buscar en YouTube.");
    }
  }
};


