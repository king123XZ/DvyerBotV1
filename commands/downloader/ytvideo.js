const axios = require("axios");

module.exports = {
  command: ["ytvideo"],
  description: "Selecciona la calidad de video de YouTube para descargar",

  run: async (client, m, args) => {
    const url = args[0];
    if (!url || !url.startsWith("http")) return m.reply("❌ Enlace de YouTube no válido.");

    // Guardamos el link solo para el usuario que lo pidió
    global.ytCache = global.ytCache || {};
    global.ytCache[m.sender] = url;

    // Botones para calidades
    const buttons = [
      { buttonId: `.ytq 144_${m.sender}`, buttonText: { displayText: "144p" }, type: 1 },
      { buttonId: `.ytq 240_${m.sender}`, buttonText: { displayText: "240p" }, type: 1 },
      { buttonId: `.ytq 360_${m.sender}`, buttonText: { displayText: "360p" }, type: 1 },
      { buttonId: `.ytq 480_${m.sender}`, buttonText: { displayText: "480p" }, type: 1 },
      { buttonId: `.ytq 720_${m.sender}`, buttonText: { displayText: "720p" }, type: 1 },
      { buttonId: `.ytq 1080_${m.sender}`, buttonText: { displayText: "1080p" }, type: 1 },
      { buttonId: `.ytq 1440_${m.sender}`, buttonText: { displayText: "1440p" }, type: 1 },
      { buttonId: `.ytq 4k_${m.sender}`, buttonText: { displayText: "4K" }, type: 1 },
    ];

    await client.sendMessage(m.chat, {
      text: "📥 *Selecciona la calidad del video:*",
      footer: "YerTX Bot • DVYER",
      buttons,
      headerType: 1
    }, { quoted: m });
  }
};

// =====================
// Manejo de botones (.ytq)
// =====================
module.exports.handleButton = async (client, m, buttonId) => {
  try {
    const parts = buttonId.split("_");
    const quality = parts[0].replace(".ytq ", "");
    const userId = parts[1];

    if (m.sender !== userId) return m.reply("⚠️ Solo el usuario que pidió este video puede usar este botón.");

    const videoUrl = global.ytCache[userId];
    if (!videoUrl) return m.reply("❌ No se encontró el enlace del video. Vuelve a usar el comando.");

    await m.reply(`⏳ Descargando video en ${quality}...`);

    const qualities = ["4k", "1440", "1080", "720", "480", "360", "240", "144"];
    let success = false;
    let downloadUrl = "";

    for (const q of qualities) {
      try {
        if (q !== quality) continue;

        // Llamada a tu API de Sky Ultra
        const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
        const { data } = await axios.post(
          "https://api-sky.ultraplus.click/youtube-video",
          { url: videoUrl, quality: q },
          { headers: { "Content-Type": "application/json", apikey: API_KEY } }
        );

        if (data.status && data.result?.media?.video) {
          downloadUrl = data.result.media.video;
          success = true;
          break;
        }
      } catch {}
    }

    if (!success) return m.reply("❌ No se pudo descargar el video en la calidad seleccionada.");

    await client.sendMessage(m.chat, {
      video: { url: downloadUrl },
      caption: `🎬 Video descargado en ${quality}`,
      mimetype: "video/mp4"
    });

  } catch (err) {
    console.error("YTVIDEO BUTTON ERROR:", err);
    m.reply("❌ Ocurrió un error al procesar el botón.");
  }
};

