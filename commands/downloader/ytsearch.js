const axios = require('axios');

const API_KEY = 'M8EQKBf7LhgH';
const API_BASE = 'https://api-sky.ultraplus.click';

module.exports = {
  command: ["play","ytsearch","yt"],
  description: "Buscar videos de YouTube usando la API y enviar info",
  category: "downloader",
  run: async (msg, { conn, args }) => {
    try {
      // --- OBTENER chatId ---
      const chatId = msg.key?.remoteJid || msg.chat || (msg?.from) || null;
      if (!chatId) {
        console.log('⚠️ No se pudo obtener chatId del mensaje');
        return;
      }

      if (!args[0]) {
        await conn.sendMessage(chatId, { text: "⚠️ Ingresa el nombre de la canción o artista a buscar." }, { quoted: msg });
        return;
      }

      const query = args.join(" ");
      await conn.sendMessage(chatId, { text: `⏳ Buscando: *${query}* ...` }, { quoted: msg });

      // --- LLAMADA A LA API ---
      const res = await axios.get(`${API_BASE}/api/utilidades/ytsearch.js`, {
        params: { q: query },
        headers: { Authorization: `Bearer ${API_KEY}` }
      });

      const results = res.data?.Result;
      if (!results || results.length === 0) {
        await conn.sendMessage(chatId, { text: "❌ No se encontraron resultados." }, { quoted: msg });
        return;
      }

      // --- TOMAMOS EL PRIMER RESULTADO ---
      const video = results[0];
      const replyText = `
🎬 *Título:* ${video.titulo}
📌 *Canal:* ${video.canal}
⏱ *Duración:* ${video.duracion}
👁 *Vistas:* ${video.vistas.toLocaleString()}
📅 *Fecha:* ${video.fecha}
🔗 *Enlace:* ${video.url}
      `.trim();

      await conn.sendMessage(chatId, {
        image: { url: video.miniatura },
        caption: replyText
      }, { quoted: msg });

    } catch (err) {
      console.error("❌ Error al usar API de búsqueda:", err);
      const chatId = msg.key?.remoteJid || msg.chat || (msg?.from) || null;
      if (chatId) {
        await conn.sendMessage(chatId, { text: "❌ Ocurrió un error al buscar la canción." }, { quoted: msg });
      }
    }
  }
};
