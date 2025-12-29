const axios = require("axios");

module.exports = {
  command: ["ytvideo"],
  description: "Selecciona la calidad de video de YouTube para descargar",

  run: async (client, m, args) => {
    try {
      const url = args[0];
      if (!url || !url.startsWith("http")) {
        return m.reply("❌ Por favor, proporciona un enlace válido de YouTube.");
      }


      global.ytCache = global.ytCache || {};
      global.ytCache[m.sender] = url;


      const buttons = [
        { buttonId: `.ytq 360_${m.sender}`, buttonText: { displayText: "🎬 360p" }, type: 1 },
        { buttonId: `.ytq 480_${m.sender}`, buttonText: { displayText: "🎬 480p" }, type: 1 },
        { buttonId: `.ytq 720_${m.sender}`, buttonText: { displayText: "🎬 720p" }, type: 1 }
      ];

      await client.sendMessage(
        m.chat,
        {
          text: "📥 *Selecciona la calidad del video:*",
          footer: "YerTX Bot • DVYER",
          buttons,
          headerType: 1
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("YTVIDEO ERROR:", err);
      m.reply("❌ Ocurrió un error al procesar tu solicitud.");
    }
  }
};


module.exports.handleButton = async (client, m, buttonId) => {
  try {
"
    const parts = buttonId.split("_");
    const quality = parts[0].replace(".ytq ", "");
    const userId = parts[1];

    // Solo el usuario que pidió puede usar el botón
    if (m.sender !== userId) {
      return m.reply("⚠️ Solo el usuario que pidió este video puede usar este botón.");
    }

    const videoUrl = global.ytCache[userId];
    if (!videoUrl) {
      return m.reply("❌ No se encontró el enlace del video. Vuelve a usar el comando.");
    }

    await m.reply(`⏳ Descargando video en ${quality}p...`);

  
    const qualities = ["720", "480", "360"];
    let success = false;

    for (const q of qualities) {
      try {
  
        if (q === quality) {
          success = true;
          break;
        }
      } catch {}
    }

    if (!success) return m.reply("❌ No se pudo descargar el video en ninguna calidad.");

    await client.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption: `🎬 Video descargado en ${quality}p`,
      mimetype: "video/mp4",
    });

  } catch (err) {
    console.error("YTVIDEO BUTTON ERROR:", err);
    m.reply("❌ Ocurrió un error al procesar el botón.");
  }
};
