const axios = require('axios');

const API_KEY = 'M8EQKBf7LhgH'; // Tu key
const API_BASE = 'https://api-sky.ultraplus.click';

module.exports = {
  command: ["play","ytsearch","yt"],
  description: "Buscar videos de YouTube y mostrar botones de descarga",
  category: "downloader",
  run: async (msg, { conn, args }) => {
    try {
      const chatId = msg.key.remoteJid || (msg.key?.fromMe ? msg.key.participant : null);
      if (!chatId) return conn.sendMessage(chatId, { text: "⚠️ No se pudo obtener chatId del mensaje." }, { quoted: msg });

      if (!args[0]) return conn.sendMessage(chatId, { text: "⚠️ Ingresa el nombre de la canción o artista a buscar." }, { quoted: msg });

      const query = args.join(" ");
      await conn.sendMessage(chatId, { text: `⏳ Buscando: *${query}* ...` }, { quoted: msg });

      // Llamada a la API de búsqueda
      const res = await axios.get(`${API_BASE}/api/utilidades/ytsearch.js`, {
        params: { q: query },
        headers: { Authorization: `Bearer ${API_KEY}` }
      });

      const results = res.data?.Result;
      if (!results || results.length === 0) return conn.sendMessage(chatId, { text: "❌ No se encontraron resultados." }, { quoted: msg });

      // Tomamos el primer resultado
      const video = results[0];
      const caption = `
🎬 *Título:* ${video.titulo}
📌 *Canal:* ${video.canal}
⏱ *Duración:* ${video.duracion}
👁 *Vistas:* ${video.vistas.toLocaleString()}
🔗 *Enlace:* ${video.url}
      `.trim();

      const buttons = [
        { buttonId: `ytaudio ${video.url}`, buttonText: { displayText: '🎵 Audio' }, type: 1 },
        { buttonId: `ytvideo ${video.url}`, buttonText: { displayText: '📹 Video' }, type: 1 },
        { buttonId: `ytdoc ${video.url}`, buttonText: { displayText: '📄 Documento' }, type: 1 },
      ];

      await conn.sendMessage(chatId, {
        image: { url: video.miniatura },
        caption,
        footer: "_La Suki Bot_",
        buttons,
        headerType: 4
      }, { quoted: msg });

    } catch (err) {
      console.error("❌ Error al usar API de búsqueda:", err);
      const chatId = msg.key?.remoteJid || (msg.key?.fromMe ? msg.key.participant : null);
      if (chatId) await conn.sendMessage(chatId, { text: "❌ Ocurrió un error al buscar la canción." }, { quoted: msg });
    }
  }
};
