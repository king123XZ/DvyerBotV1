const axios = require('axios');

const API_KEY = 'M8EQKBf7LhgH';
const API_BASE = 'https://api-sky.ultraplus.click';

module.exports = {
  command: ["play","ytsearch","yt"],
  description: "Buscar videos de YouTube y enviar enlace",
  category: "downloader",
  run: async (msg, { conn, args }) => {
    const chatId = msg.key.remoteJid;

    if (!args || args.length === 0) {
      return conn.sendMessage(chatId, {
        text: "⚠️ Ingresa el nombre de la canción o artista a buscar."
      }, { quoted: msg });
    }

    const query = args.join(" ");
    await conn.sendMessage(chatId, {
      text: `⏳ Buscando: *${query}* ...`
    }, { quoted: msg });

    try {
      // Llamada a la API de búsqueda
      const res = await axios.get(`${API_BASE}/api/utilidades/ytsearch.js`, {
        params: { q: query },
        headers: { Authorization: `Bearer ${API_KEY}` }
      });

      const results = res.data?.result;
      if (!results || results.length === 0) {
        return conn.sendMessage(chatId, {
          text: "❌ No se encontraron resultados."
        }, { quoted: msg });
      }

      // Tomamos el primer resultado
      const video = results[0];
      const replyText = `
🎬 *Título:* ${video.title}
📌 *Canal:* ${video.author}
⏱ *Duración:* ${video.duration}
👁 *Vistas:* ${video.views}
🔗 *Enlace:* ${video.url}
      `.trim();

      await conn.sendMessage(chatId, {
        image: { url: video.thumbnail },
        caption: replyText
      }, { quoted: msg });

    } catch (err) {
      console.error("❌ Error al usar API de búsqueda:", err);
      await conn.sendMessage(chatId, {
        text: "❌ Ocurrió un error al buscar la canción."
      }, { quoted: msg });
    }
  }
};
