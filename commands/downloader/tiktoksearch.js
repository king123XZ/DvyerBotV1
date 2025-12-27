const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";

module.exports = {
  command: ["tiktoksearch", "ttsearch"],
  category: "downloader",
  description: "Buscar TikToks (5 resultados)",

  run: async (client, m, args) => {
    try {
      if (!args.length) {
        return m.reply("❌ Ejemplo:\n.tiktoksearch anime edit");
      }

      const query = args.join(" ");
      await m.reply(`🔎 Buscando en TikTok: *${query}*`);

      const r = await axios.post(
        "https://api-sky.ultraplus.click/search/tiktok",
        { q: query },
        { headers: { apikey: API_KEY } }
      );

      const items = r.data?.result?.items;
      if (!items || !items.length) {
        return m.reply("❌ No se encontraron resultados.");
      }

      // 🔥 Tomamos solo 5
      const videos = items.slice(0, 5);

      for (let i = 0; i < videos.length; i++) {
        const v = videos[i];

        const caption = `🎬 *TikTok ${i + 1}/5*
━━━━━━━━━━━━━━
👤 Autor: ${v.author?.name || "?"}
❤️ Likes: ${v.stats?.likes || "?"}
👁 Vistas: ${v.stats?.views || "?"}

🔗 ${v.url}
━━━━━━━━━━━━━━`;

        const buttons = [
          {
            buttonId: `.tiktok ${v.url}`,
            buttonText: { displayText: "📥 Descargar video" },
            type: 1
          }
        ];

        await client.sendMessage(
          m.chat,
          {
            image: { url: v.cover || v.thumbnail },
            caption,
            footer: "YerTX Bot",
            buttons,
            headerType: 4
          },
          { quoted: i === 0 ? m : null }
        );
      }

    } catch (err) {
      console.error("TT SEARCH ERROR:", err.response?.data || err.message);
      m.reply("❌ Error al buscar en TikTok.");
    }
  }
};

