const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";

module.exports = {
  command: ["mediafire", "mf"],
  category: "downloader",
  description: "Descargar archivos de MediaFire",

  run: async (client, m, args) => {
    if (!args[0] || !args[0].includes("mediafire.com")) {
      return m.reply(
        "❌ Enlace inválido\n\nEjemplo:\n.mediafire https://www.mediafire.com/file/xxxxx"
      );
    }

    await m.reply("⏳ Analizando archivo de MediaFire...");

    try {
      const { data } = await axios.post(
        "https://api-sky.ultraplus.click/download/mediafire",
        { url: args[0] },
        { headers: { apikey: API_KEY } }
      );

      // ✅ AQUÍ ESTABA EL ERROR
      const files = data?.result?.files;

      if (!files || !files.length) {
        console.log("RESPUESTA API:", data);
        return m.reply("❌ No se pudo obtener el archivo.");
      }

      const file = files[0];

      const text = `
📦 *MediaFire Downloader*
━━━━━━━━━━━━━━━
📄 *Nombre:* ${file.name}
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

    } catch (e) {
      console.error("MEDIAFIRE ERROR:", e.response?.data || e.message);
      m.reply("❌ Error al procesar el enlace de MediaFire.");
    }
  }
};


