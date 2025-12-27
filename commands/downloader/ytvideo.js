const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
const BASE = "https://api-sky.ultraplus.click";

module.exports = {
  command: ["ytvideo"],
  category: "downloader",
  description: "Descargar video de YouTube con selección de calidad",

  run: async (client, m, args) => {
    if (!args[0]) {
      return m.reply("⚠️ Usa: .ytvideo <link de YouTube>");
    }

    const url = args[0];

    try {
      // 1️⃣ Obtener opciones (NO cobra)
      const opt = await axios.post(
        `${BASE}/youtube-mp4`,
        { url },
        { headers: { apikey: API_KEY } }
      );

      const list = opt.data?.result;
      if (!Array.isArray(list) || list.length === 0) {
        return m.reply("❌ No se pudieron obtener calidades del video.");
      }

      // 2️⃣ Crear botones de calidad
      const buttons = list.map(q => ({
        buttonId: `.ytq ${url} ${q.quality}`,
        buttonText: { displayText: `${q.quality}p` },
        type: 1
      }));

      // 3️⃣ Enviar mensaje con botones
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

    } catch (err) {
      console.error(err);
      m.reply("❌ Error al obtener las opciones del video.");
    }
  }
};


