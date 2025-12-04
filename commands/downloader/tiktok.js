const fetch = require('node-fetch');

module.exports = {
  command: ["tiktok", "tt"],
  description: "Descarga videos de TikTok usando tu API\n\nAPI usada: https://api-sky.ultraplus.click/\nOwner: devYer",
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
        { headers: { Authorization: `Bearer ${apiKey}` } }
      );

      const data = await res.json();

      const downloadUrl = data.data.video;
      if (!downloadUrl) {
        return m.reply("❌ No se pudo obtener el video. Verifica el enlace.");
      }

      const caption = `🎬 TikTok Downloader
Título: ${data.data.title || "Desconocido"}
Autor: ${data.data.author.name || data.data.author.username || "Desconocido"}
Vistas: ${data.data.views || 0} | Likes: ${data.data.likes || 0} | Comentarios: ${data.data.comments || 0}`;

      await client.sendMessage(
        m.chat,
        {
          video: { url: downloadUrl },
          caption,
          mimetype: "video/mp4",
          fileName: "tiktok.mp4",
        },
        { quoted: m }
      );
    } catch (e) {
      console.error(e);
      m.reply("❌ Ocurrió un error al procesar el video de TikTok");
    }
  },
};

