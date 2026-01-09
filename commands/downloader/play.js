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
        return client.reply(
          m.chat,
          "⚠️ Ingresa el nombre de la canción o artista.",
          m,
          global.channelInfo
        );
      }

      const query = args.join(" ");

      // ⏳ Mensaje de búsqueda
      await client.reply(
        m.chat,
        `⏳ Buscando: *${query}* ...`,
        m,
        global.channelInfo
      );

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
          return client.reply(
            m.chat,
            "❌ No se encontraron resultados.",
            m,
            global.channelInfo
          );
        }

        video = items[0];

      } else {
        // 🌍 BÚSQUEDA LOCAL (yt-search)
        const search = await yts(query);
        if (!search.videos || !search.videos.length) {
          return client.reply(
            m.chat,
            "❌ No se encontraron resultados.",
            m,
            global.channelInfo
          );
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

      // 🧾 MENSAJE FINAL CON BOTONES
      const caption =
        `🎬 *Título:* ${video.title}\n` +
        `📌 *Canal:* ${video.author?.name || "YouTube"}\n` +
        `⏱ *Duración:* ${video.duration || "?"}\n` +
        `👁 *Vistas:* ${video.views?.toLocaleString?.() || "?"}\n` +
        `🔗 *Enlace:* ${video.url}`;

      const buttons = [
        { buttonId: `.ytaudio ${video.url}`, buttonText: { displayText: "🎵 Audio" }, type: 1 },
        { buttonId: `.yt2 ${video.url}`, buttonText: { displayText: "🎬 Video" }, type: 1 },
        { buttonId: `.ytdoc ${video.url}`, buttonText: { displayText: "📂DOC(Videos largos)" }, type: 1 }
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
        {
          quoted: m,
          ...global.channelInfo
        }
      );

    } catch (err) {
      console.error("PLAY ERROR:", err.response?.data || err.message);
      await client.reply(
        m.chat,
        "❌ Error al buscar en YouTube.",
        m,
        global.channelInfo
      );
    }
  }
};

