const fetch = require('node-fetch');

module.exports = {
  command: ["tiktok", "tt"],
  description: "Descarga videos de TikTok usando tu API",
  category: "downloader",
  use: "https://www.tiktok.com/",
  run: async (client, m, args) => {
    if (!args[0]) {
      return m.reply(
        "Ingresa el *enlace* de un video de *TikTok*\n\n`Ejemplo`\n!tiktok https://www.tiktok.com/@user/video/123"
      );
    }

    await m.reply("⏳ Procesando tu video...");

    try {
      const videoUrl = args[0];
      const apiKey = "AvTYmkABPtmG";

      const res = await fetch(
        `https://api-sky.ultraplus.click/api/download/tiktok.js?url=${encodeURIComponent(videoUrl)}`,
        {
          headers: { Authorization: `Bearer ${apiKey}` }
        }
      );

      const data = await res.json();

      if (!data || !data.url) {
        return m.reply("❌ No se pudo obtener el video. Verifica el enlace.");
      }

      await client.sendMessage(
        m.chat,
        {
          video: { url: data.url },
          caption: `TikTok Downloader\n\nTítulo: ${data.title || "Desconocido"}`,
          mimetype: "video/mp4",
          fileName: "tiktok.mp4"
        },
        { quoted: m }
      );
    } catch (e) {
      console.error(e);
      m.reply("❌ Ocurrió un error al procesar el video de TikTok");
    }
  },
};
