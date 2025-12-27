const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
const BASE = "https://api-sky.ultraplus.click";

module.exports = {
  command: ["ytvideo"],
  category: "downloader",

  run: async (client, m, args) => {
    if (!args[0]) return m.reply("⚠️ Usa: .ytvideo <link o nombre>");

    try {
      let videoUrl = args[0];

      // 🔎 SI NO ES LINK → BUSCAR
      if (!videoUrl.startsWith("http")) {
        const search = await axios.post(
          `${BASE}/search/youtube`,
          { q: args.join(" ") },
          { headers: { apikey: API_KEY } }
        );

        const item = search.data?.result?.items?.[0];
        if (!item?.url) {
          return m.reply("❌ No se encontró el video.");
        }

        videoUrl = item.url;
      }

      // 1️⃣ Obtener opciones (NO cobra)
      const opt = await axios.post(
        `${BASE}/youtube-mp4`,
        { url: videoUrl },
        { headers: { apikey: API_KEY } }
      );

      const list = opt.data?.result;
      if (!Array.isArray(list) || !list.length) {
        return m.reply("❌ No hay calidades disponibles.");
      }

      // 2️⃣ Crear botones SOLO con datos válidos
      const buttons = list.map(q => ({
        buttonId: `.ytq ${videoUrl} ${q.quality}`,
        buttonText: { displayText: `${q.quality}p` },
        type: 1
      }));

      // 3️⃣ Enviar botones
      await client.sendMessage(
        m.chat,
        {
          text: "🎬 *Elige la calidad del video:*",
          footer: "YerTX Bot",
          buttons,
          headerType: 1
        },
        { quoted: m }
      );

    } catch (e) {
      console.error(e);
      m.reply("❌ Error al procesar el video.");
    }
  }
};
;


