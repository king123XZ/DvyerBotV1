const axios = require("axios");

module.exports = {
  command: ["yt1"], // comando principal
  category: "downloader",

  run: async (client, m, args) => {
    const url = args[0];

    if (!url || !url.startsWith("http")) {
      return m.reply("❌ Enlace de YouTube no válido.");
    }

    try {
      await m.reply("⏳ Descargando video desde YouTube...");

      // Llamada a la API de UltraPlus
      const response = await axios.post(
        "https://api-sky.ultraplus.click/aio1",
        { url }, // enviar el enlace de YouTube
        {
          headers: {
            apikey: "sk_f606dcf6-f301-4d69-b54b-505c12ebec45"
          },
          responseType: "arraybuffer" // para obtener el video como archivo
        }
      );

      // Convertir la respuesta en Buffer para enviar por WhatsApp
      const videoBuffer = Buffer.from(response.data);

      // Enviar el video al chat
      await client.sendMessage(
        m.chat,
        { video: videoBuffer, caption: "🎬 Tu video de YouTube" },
        { quoted: m }
      );

    } catch (err) {
      console.error(err);
      m.reply("❌ Ocurrió un error al descargar el video. Revisa el enlace o intenta de nuevo.");
    }
  }
};

