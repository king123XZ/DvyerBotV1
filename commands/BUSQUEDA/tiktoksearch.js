const axios = require("axios");

// GAWRGURA SEARCH API
const SEARCH_API = "https://gawrgura-api.onrender.com/search/tiktok";

// BOT
const BOT_NAME = "KILLUA-BOT v1.00";

module.exports = {
  command: ["tiktoksearch", "ttsearch", "ttbuscar"],
  category: "search",

  run: async (client, m, args) => {
    try {
      const query = args.join(" ");

      if (!query) {
        return client.reply(
          m.chat,
          "❌ Escribe algo para buscar en TikTok.\nEjemplo:\n.tiktoksearch gatos",
          m,
          global.channelInfo
        );
      }

      // ⏳ UX
      await client.reply(
        m.chat,
        `🔎 *Buscando en TikTok...*\n` +
        `🤖 ${BOT_NAME}`,
        m,
        global.channelInfo
      );

      // 📡 API
      const res = await axios.get(
        `${SEARCH_API}?q=${encodeURIComponent(query)}`,
        { timeout: 60000 }
      );

      const results = res.data?.result || res.data?.data;
      if (!Array.isArray(results) || results.length === 0) {
        return client.reply(
          m.chat,
          "❌ No se encontraron resultados.",
          m,
          global.channelInfo
        );
      }

      // 🔢 Limitar resultados
      const max = 5;
      let text = `🔎 *Resultados TikTok*\n\n`;

      results.slice(0, max).forEach((v, i) => {
        text +=
          `*${i + 1}.* 👤 ${v.author || v.username || "Desconocido"}\n` +
          `❤️ ${v.like || v.likes || 0} | 👁 ${v.view || v.views || 0}\n` +
          `🔗 ${v.url || v.link}\n\n`;
      });

      // 📤 Enviar lista
      await client.reply(
        m.chat,
        text.trim(),
        m,
        global.channelInfo
      );

    } catch (err) {
      console.error("TIKTOK SEARCH ERROR:", err.response?.data || err.message);
      await client.reply(
        m.chat,
        "❌ Error al buscar en TikTok.",
        m,
        global.channelInfo
      );
    }
  }
};
