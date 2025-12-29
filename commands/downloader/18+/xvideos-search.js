const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
const API_URL = "https://api-sky.ultraplus.click/search/xvideos";

module.exports = {
  command: ["xvideos", "buscarvideo"],
  category: "search",
  description: "Busca videos usando la API",
  use: "xvideos <texto>",

  run: async (client, m, args) => {
    try {
      if (!args.length) {
        return m.reply("❌ Escribe qué video deseas buscar.");
      }

      const query = args.join(" ");

      await m.reply("🔎 Buscando videos...");

      const { data } = await axios.post(
        API_URL,
        {
          q: query,
          limit: 10
        },
        {
          headers: {
            "Content-Type": "application/json",
            apikey: API_KEY
          },
          timeout: 15000
        }
      );

      if (!data.status || !data.result?.items?.length) {
        return m.reply("❌ No se encontraron resultados.");
      }

      const results = data.result.items;

      let text = `🔍 *Resultados para:* ${query}\n\n`;

      results.forEach((v, i) => {
        text += `*${i + 1}.* ${v.title}\n`;
        if (v.duration) text += `⏱ ${v.duration}\n`;
        if (v.author?.name) text += `👤 ${v.author.name}\n`;
        text += `🔗 ${v.url}\n\n`;
      });

      m.reply(text.trim());

    } catch (err) {
      console.error("SEARCHVID ERROR:", err.response?.data || err.message);
      m.reply("❌ Error al buscar videos.");
    }
  }
};
