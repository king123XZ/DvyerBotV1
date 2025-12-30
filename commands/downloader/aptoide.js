const axios = require("axios");

const API_URL = "https://api-sky.ultraplus.click/aptoide";
const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";

module.exports = {
  command: ["apk", "aptoide"],

  run: async (client, m, args) => {
    if (!args.length) return m.reply("❌ Usa:\n!apk minecraft");

    const query = args.join(" ");
    await m.reply("🔎 Buscando aplicaciones...");

    let res;
    try {
      res = await axios.post(
        API_URL,
        { query },
        { headers: { apikey: API_KEY } }
      );
    } catch (e) {
      console.error(e.response?.data || e);
      return m.reply("❌ Error conectando con la API.");
    }

    // 🔥 DETECCIÓN AUTOMÁTICA
    const results =
      res.data?.results ||
      res.data?.data ||
      res.data?.result ||
      [];

    if (!Array.isArray(results) || results.length === 0) {
      console.log("Respuesta API:", res.data);
      return m.reply("⚠️ No se encontraron resultados (API vacía).");
    }

    if (!global.apkStore) global.apkStore = {};
    global.apkStore[m.chat] = results;

    let txt = `📦 *Resultados para:* ${query}\n\n`;

    results.slice(0, 5).forEach((app, i) => {
      txt += `*${i + 1}.* ${app.name || app.title}\n`;
      txt += `🧩 Versión: ${app.version || "?"}\n`;
      txt += `💾 Tamaño: ${app.size || "?"}\n\n`;
    });

    txt += `⬇️ Usa los botones para descargar`;

    m.reply(txt);
  },
};
