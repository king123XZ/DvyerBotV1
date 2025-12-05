const axios = require('axios');

const API_KEY = 'M8EQKBf7LhgH';
const API_BASE = 'https://api-sky.ultraplus.click';

module.exports = {
  command: ["play","ytsearch","yt"],
  description: "Buscar videos de YouTube y enviar enlace",
  category: "downloader",
  run: async (client, m, args) => {
    // Obtener chatId de forma segura
    const chatId = m?.chat || m?.key?.remoteJid;
    if (!chatId) {
      console.warn("⚠️ No se pudo obtener chatId del mensaje");
      console.log("Mensaje recibido:", m);
      return;
    }

    if (!args[0]) {
      return client.sendMessage(chatId, { text: "⚠️ Ingresa el nombre de la canción o artista a buscar." }, { quoted: m });
    }

    const query = args.join(" ");
    await client.sendMessage(chatId, { text: `⏳ Buscando: *${query}* ...` }, { quoted: m });

    try {
      // Llamada a la API de búsqueda
      const res = await axios.get(`${API_BASE}/api/utilidades/ytsearch.js`, {
        params: { q: query },
        headers: { Authorization: `Bearer ${API_KEY}` }
      });

      const results = res.data?.Result;
      if (!results || results.length === 0) {
        return client.sendMessage(chatId, { text: "❌ No se encontraron resultados." }, { quoted: m });
      }

      // Tomamos los 5 primeros resultados
      const topResults = results.slice(0, 5);

      // Enviar cada resultado
      for (const video of topResults) {
        const replyText = `
🎬 *Título:* ${video.titulo}
📌 *Canal:* ${video.canal}
⏱ *Duración:* ${video.duracion}
👁 *Vistas:* ${video.vistas}
🔗 *Enlace:* ${video.url}
        `.trim();

        await client.sendMessage(chatId, {
          image: { url: video.miniatura },
          caption: replyText
        }, { quoted: m });
      }

    } catch (err) {
      console.error("❌ Error al usar API de búsqueda:", err);
      await client.sendMessage(chatId, { text: "❌ Ocurrió un error al buscar la canción." }, { quoted: m });
    }
  }
};
