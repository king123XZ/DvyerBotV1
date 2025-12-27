const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";

module.exports = {
  command: ["mediafire", "mf"],
  category: "downloader",

  run: async (client, m, args) => {
    if (!args[0] || !args[0].includes("mediafire.com")) {
      return m.reply(
        "❌ Enlace inválido\n\nEjemplo:\n.mediafire https://www.mediafire.com/file/xxxxx"
      );
    }

    await m.reply("⏳ Analizando archivo de MediaFire...");

    try {
      const res = await axios.post(
        "https://api-sky.ultraplus.click/download/mediafire",
        { url: args[0] },
        {
          headers: { apikey: API_KEY },
          timeout: 20000 // ⏱️ IMPORTANTE
        }
      );

      console.log("RESPUESTA MEDIAFIRE:", res.data);

      const files = res.data?.result?.files;

      if (!files || !files.length) {
        return m.reply("❌ No se encontró ningún archivo en MediaFire.");
      }

      const file = files[0];

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
      console.error("MEDIAFIRE ERROR REAL:", err.response?.data || err.message);

      m.reply(
        "❌ MediaFire no respondió a tiempo.\nIntenta nuevamente o usa otro enlace."
      );
    }
  }
};



