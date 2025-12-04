const axios = require('axios');
const yts = require('yt-search');

module.exports = {
  command: ["ytvideo"],
  description: "Descarga solo video de YouTube usando tu API",
  category: "downloader",
  use: "https://www.youtube.com/",
  run: async (client, m, args) => {
    if (!args[0]) return m.reply("Ingresa el enlace o nombre de un video de YouTube.");

    await m.reply("⏳ Procesando video...");

    try {
      let videoUrl = args[0];
      const apiKey = "AvTYmkABPtmG";

      // Si no es enlace, buscar por nombre
      if (!videoUrl.startsWith("http")) {
        const { videos } = await yts(videoUrl);
        if (!videos.length) return m.reply("❌ No se encontraron resultados.");
        videoUrl = videos[0].url;
      }

      const res = await axios.get("https://api-sky.ultraplus.click/api/download/yt.js", {
        params: { url: videoUrl, format: "video" },
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "X-API-Key": apiKey
        }
      });

      const data = res.data.data;

      if (!data) return m.reply("❌ No se pudo obtener el video.");
      if (!data.video) return m.reply("⚠️ No hay video disponible, tal vez solo audio.");

      const caption = `🎬 YouTube Video\nTítulo: ${data.title}\nDuración: ${data.duration || "Desconocida"}s`;

      await client.sendMessage(
        m.chat,
        {
          video: { url: data.video },
          mimetype: "video/mp4",
          fileName: `${data.title || "youtube"}.mp4`,
          caption,
          contextInfo: {
            // Miniatura como vista previa
            externalAdReply: {
              mediaUrl: data.video,
              mediaType: 2,
              description: data.title,
              title: data.title,
              thumbnailUrl: data.thumbnail
            }
          }
        },
        { quoted: m }
      );

    } catch (e) {
      if (e.response) {
        const code = e.response.status;
        if (code === 401) return m.reply("❌ Key inválida o no enviada.");
        if (code === 402) return m.reply("❌ No tienes solicitudes restantes.");
        if (code === 429) return m.reply("❌ Límite de solicitudes alcanzado. Intenta más tarde.");
        if (code === 500) return m.reply("❌ Error interno de la API.");
      }
      console.error("Error al descargar video de YouTube:", e);
      m.reply("❌ Ocurrió un error al procesar el video de YouTube.");
    }
  },
};
