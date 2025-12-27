const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";

module.exports = {
  command: ["mediafire", "mf"],
  category: "downloader",

  run: async (client, m, args) => {
    if (!args.length) {
      return m.reply("❌ Ingresa el nombre del archivo.\nEjemplo:\n.mediafire Prince Of Persia psp");
    }

    const query = args.join(" ");
    await m.reply("🔍 Buscando en MediaFire...");

    try {
      const res = await axios.post(
        "https://api-sky.ultraplus.click/search/mediafire",
        { q: query },
        { headers: { apikey: API_KEY } }
      );

      const files = res.data?.result?.files;
      if (!files || !files.length) {
        return m.reply("❌ No se encontraron archivos.");
      }

      const file = files[0];

      const caption = `
📦 *Archivo encontrado*
━━━━━━━━━━━━━━━
📄 *Nombre:* ${file.name}
📏 *Tamaño:* ${file.size}

👑 *Creador:* DevYer
      `.trim();

      const buttons = [
        {
          buttonId: `.mfget ${file.proxy}`,
          buttonText: { displayText: "⬇️ Descargar" },
          type: 1
        }
      ];

      await client.sendMessage(
        m.chat,
        {
          text: caption,
          footer: "MediaFire Downloader",
          buttons,
          headerType: 1
        },
        { quoted: m }
      );

    } catch (e) {
      console.error("MEDIAFIRE SEARCH ERROR:", e.response?.data || e);
      m.reply("❌ Error al buscar en MediaFire.");
    }
  }
};
