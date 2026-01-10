const axios = require("axios");

// GAWRGURA API
const SEARCH_API = "https://gawrgura-api.onrender.com/search/tiktok";

// BOT
const BOT_NAME = "KILLUA-BOT v1.00";

module.exports = {
  command: ["tiktoksearch", "tiktokbuscar", "ttks"],
 categoria: "busqueda",

  run: async (client, m, args) => {
    try {
      const query = args.join(" ");

      if (!query) {
        return client.reply(
          m.chat,
          "❌ Escribe algo para buscar en TikTok.\nEjemplo:\n.tiktoksearch goku",
          m,
          global.channelInfo
        );
      }

      // ⏳ UX
      await client.reply(
        m.chat,
        `🔎 *Buscando en TikTok...*\n🤖 ${BOT_NAME}`,
        m,
        global.channelInfo
      );

      // 📡 API
      const res = await axios.get(
        `${SEARCH_API}?q=${encodeURIComponent(query)}`,
        { timeout: 60000 }
      );

      const results = res.data?.result;
      if (!Array.isArray(results) || results.length === 0) {
        return client.reply(
          m.chat,
          "❌ No se encontraron resultados.",
          m,
          global.channelInfo
        );
      }

      // 🔢 Limitar a 5
      const videos = results.slice(0, 5);

      for (const v of videos) {
        const title = (v.title || "TikTok")
          .replace(/[\\/:*?"<>|]/g, "")
          .slice(0, 50);

        const caption =
          `🎵 *TikTok*\n` +
          `👤 ${v.author?.nickname || "Desconocido"}\n` +
          `❤️ ${v.digg_count || 0} | 👁 ${v.play_count || 0}\n` +
          `⏱ ${v.duration || 0}s\n`;

        await client.sendMessage(
          m.chat,
          {
            video: { url: v.play }, // preview video
            caption
          },
          { quoted: m, ...global.channelInfo }
        );
      }

    } catch (err) {
      console.error("TIKTOK SEARCH ERROR:", err.response?.data || err.message);
      await client.reply(
        m.chat,
        "❌ Error al buscar videos de TikTok.",
        m,
        global.channelInfo
      );
    }
  }
};

