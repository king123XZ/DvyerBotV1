const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
const BASE = "https://api-sky.ultraplus.click";

module.exports = {
  command: ["ytvideo"],

  run: async (client, m, args) => {
    if (!args[0]) {
      return m.reply("⚠️ Usa: .ytvideo <link de YouTube>");
    }

    const url = args[0];

    try {
      const res = await axios.post(
        `${BASE}/youtube-mp4`,
        { url },
        { headers: { apikey: API_KEY } }
      );

      if (!res.data?.status) {
        return m.reply("❌ La API no respondió correctamente.");
      }

      // 🔥 DETECCIÓN INTELIGENTE
      let qualities =
        res.data.result?.formats ||
        res.data.result?.video ||
        res.data.result;

      if (!Array.isArray(qualities) || qualities.length === 0) {
        console.log("DEBUG API:", JSON.stringify(res.data, null, 2));
        return m.reply("❌ No se pudieron obtener calidades del video.");
      }

      // eliminar duplicados
      qualities = [...new Set(qualities.map(q => q.quality))];

      const buttons = qualities.map(q => ({
        buttonId: `.ytq ${url} ${q}`,
        buttonText: { displayText: `${q}p` },
        type: 1
      }));

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
      m.reply("❌ Error conectando con la API.");
    }
  }
};

