const axios = require('axios');

const API_KEY = 'M8EQKBf7LhgH';
const API_BASE = 'https://api-sky.ultraplus.click';

module.exports = {
  command: ["play","ytsearch","yt"],
  description: "Buscar videos de YouTube usando la API y mostrar información",
  category: "downloader",
  run: async (client, m, args) => {
    if (!args[0]) return m.reply("⚠️ Ingresa el nombre de la canción o artista a buscar.");

    const query = args.join(" ");
    await m.reply(`⏳ Buscando: *${query}* ...`);

    try {
      // Llamada a la API de búsqueda
      const res = await axios.get(`${API_BASE}/api/utilidades/ytsearch.js`, {
        params: { q: query },
        headers: { Authorization: `Bearer ${API_KEY}` }
      });

      const results = res.data?.Result;
      if (!results || results.length === 0) return m.reply("❌ No se encontraron resultados.");

      // Tomamos los primeros 5 resultados
      let replyText = `🔎 Resultados para: *${query}*\n\n`;
      results.slice(0, 5).forEach((video, i) => {
        replyText += `🎬 *${i+1}. ${video.titulo}*\n`;
        replyText += `📌 Canal: ${video.canal}\n`;
        replyText += `⏱ Duración: ${video.duracion}\n`;
        replyText += `👁 Vistas: ${video.vistas}\n`;
        replyText += `🔗 Enlace: ${video.url}\n\n`;
      });

      // Enviar el primer video con miniatura
      const firstVideo = results[0];
      await client.sendMessage(
        m.chat,
        {
          image: { url: firstVideo.miniatura },
          caption: replyText.trim()
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("❌ Error al usar API de búsqueda:", err);
      await m.reply("❌ Ocurrió un error al buscar la canción.");
    }
  }
};
