const axios = require("axios");

const API_URL = "https://api-sky.ultraplus.click/aptoide";
const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";

function formatSize(bytes) {
  if (!bytes) return "Desconocido";
  return (bytes / 1024 / 1024).toFixed(2) + " MB";
}

module.exports = {
  command: ["apk", "aptoide"],

  run: async (client, m, args) => {
    if (!args.length) return m.reply("❌ Usa:\n!apk whatsapp");

    const query = args.join(" ");
    await m.reply("🔎 Buscando aplicaciones...");

    const res = await axios.post(
      API_URL,
      { query },
      { headers: { apikey: API_KEY } }
    );

    const results = res?.data?.result?.results;

    if (!Array.isArray(results) || results.length === 0) {
      return m.reply("⚠️ No se encontraron resultados.");
    }

    // Guardar resultados por chat
    if (!global.apkStore) global.apkStore = {};
    global.apkStore[m.chat] = results;

    let txt = `📦 *Resultados para:* ${query}\n`;
    txt += `🔢 Total: ${results.length}\n\n`;

    results.slice(0, 5).forEach((app, i) => {
      txt += `*${i + 1}.* ${app.name}\n`;
      txt += `🧩 Versión: ${app.version}\n`;
      txt += `💾 Tamaño: ${formatSize(app.size)}\n`;
      txt += `⭐ Rating: ${app.rating}\n`;
      txt += `⬇️ Descargas: ${app.downloads}\n\n`;
    });

    txt += `⬇️ Para descargar usa:\n!apkdl número\nEjemplo: !apkdl 1`;

    m.reply(txt);
  },
};

