const axios = require('axios');
const yts = require('yt-search');

module.exports = {
  command: ["youtube", "yt", "ytaudio"],
  description: "Descarga solo el audio de YouTube usando tu API, mejorando búsqueda",
  category: "downloader",
  use: "https://www.youtube.com/",
  run: async (client, m, args) => {
    if (!args[0]) return m.reply("Ingresa el enlace o nombre de un video de YouTube.");

    await m.reply("⏳ Procesando audio...");

    try {
      let videoUrl = args[0];
      const apiKey = "M8EQKBf7LhgH";

      // Si no es enlace, buscar por nombre con yt-search
      if (!videoUrl.startsWith("http")) {
        const { videos } = await yts(videoUrl);
        if (!videos.length) return m.reply("❌ No se encontraron resultados.");
        
        // Elegir el video más relevante (primer resultado)
        videoUrl = videos[0].url;
      }

      // Llamada a la API para descargar audio
      const res = await axios.get("https://api-sky.ultraplus.click/api/download/yt.js", {
        params: { url: videoUrl, format: "audio" },
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "X-API-Key": apiKey
        }
      });

      const data = res.data.data;
      if (!data || !data.audio) return m.reply("❌ No se pudo obtener el audio.");

      const caption = `🎵 YouTube Audio\nTítulo: ${data.title}\nDuración: ${data.duration || "Desconocida"}s`;

      await client.sendMessage(
        m.chat,
        {
          audio: { url: data.audio },
          mimetype: "audio/mpeg",
          fileName: `${data.title || "youtube"}.mp3`,
          caption,
          contextInfo: {
            externalAdReply: {
              mediaUrl: videoUrl,
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
      console.error("Error al descargar audio de YouTube:", e);
      m.reply("❌ Ocurrió un error al procesar el audio de YouTube.");
    }
  },
};

