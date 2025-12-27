const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

module.exports = {
  command: ["tiktoksearch", "ttsearch"],
  category: "downloader",

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

      if (!Array.isArray(items) || items.length === 0) {
        return m.reply("❌ No se encontraron resultados.");
      }

      const videos = items.slice(0, 5);

      for (let i = 0; i < videos.length; i++) {
        const v = videos[i];

        // 🔒 VALIDACIONES CRÍTICAS
        if (!v || !v.url) continue;

        const caption = `🎬 *Resultado ${i + 1}/5*
━━━━━━━━━━━━━━
👤 Autor: ${v.author?.name || "Desconocido"}
👁 Vistas: ${v.stats?.views || "?"}
❤️ Likes: ${v.stats?.likes || "?"}

🔗 ${v.url}
━━━━━━━━━━━━━━`;

        const buttons = [
          {
            buttonId: `.tiktok ${v.url}`,
            buttonText: { displayText: "📥 Descargar video" },
            type: 1
          }
        ];

        // 👉 SI NO HAY IMAGEN → TEXTO
        if (!v.cover && !v.thumbnail) {
          await client.sendMessage(
            m.chat,
            { text: caption },
            { quoted: m }
          );
        } else {
          await client.sendMessage(
            m.chat,
            {
              image: { url: v.cover || v.thumbnail },
              caption,
              buttons,
              footer: "YerTX Bot",
              headerType: 4
            },
            { quoted: m }
          );
        }

        await sleep(800); // 🔥 evita flood / bloqueo
      }

    } catch (err) {
      console.error("❌ TIKTOK SEARCH ERROR:", err.response?.data || err);
      m.reply("❌ Error al mostrar los resultados.");
    }
  }
};


