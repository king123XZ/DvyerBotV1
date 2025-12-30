const axios = require("axios");

const API_URL = "https://api-sky.ultraplus.click/aptoide";
const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";

module.exports = {
  command: ["apk", "aptoide"],
  description: "Buscar apps en Aptoide (carrusel)",

  run: async (client, m, args) => {
    if (!args.length) return m.reply("❌ Usa:\n!apk minecraft");

    const query = args.join(" ");
    await m.reply("🔎 Buscando aplicaciones...");

    const { data } = await axios.post(
      API_URL,
      { query },
      { headers: { apikey: API_KEY } }
    );

    if (!data.results || !data.results.length) {
      return m.reply("⚠️ No se encontraron resultados.");
    }

    // Guardar resultados por chat
    if (!global.apkStore) global.apkStore = {};
    global.apkStore[m.chat] = data.results;

    const cards = data.results.slice(0, 5).map((app, i) => ({
      header: {
        title: app.name,
        subtitle: `Versión ${app.version}`,
      },
      body: {
        text:
          `📱 Paquete: ${app.package}\n` +
          `💾 Tamaño: ${app.size}`,
      },
      footer: {
        text: "DVYER APK STORE",
      },
      buttons: [
        {
          buttonId: `apkdl_${i}`,
          buttonText: { displayText: "⬇️ Descargar APK" },
          type: 1,
        },
      ],
    }));

    await client.sendMessage(
      m.chat,
      {
        interactiveMessage: {
          header: { title: "📦 Resultados Aptoide" },
          body: { text: `Resultados para: *${query}*` },
          footer: { text: "DVYER PRO" },
          carouselMessage: { cards },
        },
      },
      { quoted: m }
    );
  },
};
