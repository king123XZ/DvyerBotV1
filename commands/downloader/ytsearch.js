const axios = require('axios');

const API_KEY = 'M8EQKBf7LhgH';
const API_BASE = 'https://api-sky.ultraplus.click';

module.exports = {
  command: ["play","ytsearch","yt"],
  description: "Buscar videos de YouTube y enviar enlace",
  category: "downloader",
  run: async (client, msg, args) => {
    try {
      const chatId = msg?.key?.remoteJid || msg?.message?.chatId;
      if (!chatId) return console.warn('⚠️ No se pudo obtener chatId del mensaje');

      if (!args[0]) {
        return client.sendMessage(chatId, { text: "⚠️ Ingresa el nombre de la canción o artista a buscar." }, { quoted: msg });
      }

      const query = args.join(" ");
      await client.sendMessage(chatId, { text: `⏳ Buscando: *${query}* ...` }, { quoted: msg });

      // Llamada a la API
      const res = await axios.get(`${API_BASE}/api/utilidades/ytsearch.js`, {
        params: { q: query },
        headers: { Authorization: `Bearer ${API_KEY}` }
      });

      // UltraPlus a veces devuelve "result" o "data"
      const results = res.data?.result || res.data?.data || [];
      if (!results || results.length === 0) {
        return client.sendMessage(chatId, { text: "❌ No se encontraron resultados." }, { quoted: msg });
      }

      // Tomar hasta 5 resultados
      let replyText = `🎬 Resultados de búsqueda:\n\n`;
      results.slice(0, 5).forEach((video, i) => {
        replyText += `🔹 ${i+1}. ${video.title}\n   🔗 ${video.url}\n   📌 ${video.author}\n   ⏱ ${video.duration}\n\n`;
      });

      await client.sendMessage(chatId, {
        text: replyText,
        // opcional: agregar imagen del primer video
        ...(results[0]?.thumbnail ? { image: { url: results[0].thumbnail } } : {})
      }, { quoted: msg });

    } catch (err) {
      console.error("❌ Error al usar API de búsqueda:", err);
      const chatId = msg?.key?.remoteJid || msg?.message?.chatId;
      if (chatId) {
        await client.sendMessage(chatId, { text: "❌ Ocurrió un error al buscar la canción." }, { quoted: msg });
      }
    }
  }
};
