const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";

module.exports = {
  command: ["tiktoksearch", "ttsearch"],
  category: "downloader",
  description: "Buscar videos de TikTok",

  run: async (client, m, args) => {
    try {
      if (!args.length) {
        return m.reply("❌ Escribe qué buscar\n\nEjemplo:\n.tiktoksearch anime edit");
      }

      const query = args.join(" ");
      await m.reply(`🔎 Buscando en TikTok: *${query}*`);

      const r = await axios.post(
        "https://api-sky.ultraplus.click/search/tiktok",
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

      const video = items[0]; // primer resultado

      const caption = `🎵 *TikTok encontrado*
━━━━━━━━━━━━━━━
👤 Autor: ${video.author?.name || "?"}
❤️ Likes: ${video.stats?.likes || "?"}
👁 Vistas: ${video.stats?.views || "?"}

🔗 Enlace:
${video.url}
━━━━━━━━━━━━━━━`;

      const buttons = [
        {
          buttonId: `.tiktok ${video.url}`,
          buttonText: { displayText: "📥 Descargar video" },
          type: 1
        }
      ];

      await client.sendMessage(
        m.chat,
        {
          image: { url: video.cover || video.thumbnail },
          caption,
          footer: "YerTX Bot",
          buttons,
          headerType: 4
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("TIKTOK SEARCH ERROR:", err.response?.data || err.message);
      m.reply("❌ Error al buscar en TikTok.");
    }
  }
};
