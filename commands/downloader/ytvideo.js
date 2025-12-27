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

    if (!url.startsWith("http")) {
      return m.reply("❌ Debes enviar un link válido de YouTube.");
    }

    try {
      // 🔹 PASO 1: OBTENER OPCIONES (NO COBRA)
      const res = await axios.post(
        `${BASE}/youtube-mp4`,
        { url },
        { headers: { apikey: API_KEY } }
      );

      const qualities = res.data?.result;
      if (!Array.isArray(qualities) || !qualities.length) {
        return m.reply("❌ No hay calidades disponibles.");
      }

      // 🔹 CREAR BOTONES
      const buttons = qualities.map(q => ({
        buttonId: `.ytq ${url} ${q.quality}`,
        buttonText: { displayText: `${q.quality}p` },
        type: 1
      }));

      await client.sendMessage(
        m.chat,
        {
          text: "🎬 *Selecciona la calidad del video:*",
          footer: "YerTX Bot",
          buttons,
          headerType: 1
        },
        { quoted: m }
      );

    } catch (e) {
      console.error(e);
      m.reply("❌ Error obteniendo calidades.");
    }
  }
};


