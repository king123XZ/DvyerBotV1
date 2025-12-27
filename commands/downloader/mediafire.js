const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
const MAX_MB = 1800;

module.exports = {
  command: ["mediafire", "mf"],
  category: "downloader",

  run: async (client, m, args) => {
    if (!args[0] || !args[0].includes("mediafire.com")) {
      return m.reply(
        "❌ Enlace inválido\n\nEjemplo:\n.mf https://www.mediafire.com/file/xxxxx"
      );
    }

    await m.reply("⏳ Analizando archivo de MediaFire...");

    try {
      const res = await axios.post(
        "https://api-sky.ultraplus.click/download/mediafire",
        { url: args[0] },
        {
          headers: { apikey: API_KEY },
          timeout: 20000
        }
      );

      const files = res.data?.result?.files;
      if (!files || !files.length) {
        return m.reply("❌ No se encontró ningún archivo.");
      }

      const file = files[0];

      // 📏 Extraer tamaño en MB (ej: "File  694.79MB")
      const sizeMatch = file.size.match(/([\d.]+)\s*MB/i);
      const sizeMB = sizeMatch ? parseFloat(sizeMatch[1]) : 0;

      if (sizeMB > MAX_MB) {
        return m.reply(
          `❌ Archivo demasiado grande\n\n📦 Tamaño: ${sizeMB} MB\n🔒 Límite: ${MAX_MB} MB`
        );
      }

      const text = `
📦 *MediaFire Downloader*
━━━━━━━━━━━━━━━
📄 *Archivo:* ${file.name}
📏 *Tamaño:* ${file.size}

👑 *Creador:* DevYer
      `.trim();

      const buttons = [
        {
          buttonId: `.mfget ${file.download}`,
          buttonText: { displayText: "⬇️ Descargar" },
          type: 1
        }
      ];

      await client.sendMessage(
        m.chat,
        {
          text,
          footer: "MediaFire | DevYer",
          buttons,
          headerType: 1
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("MEDIAFIRE ERROR:", err.response?.data || err.message);
      m.reply("❌ No se pudo analizar el archivo de MediaFire.");
    }
  }
};




