const axios = require('axios');

const API_KEY = 'M8EQKBf7LhgH';
const API_BASE = 'https://api-sky.ultraplus.click';

module.exports = {
  command: ["play","ytsearch","yt"],
  description: "Buscar videos de YouTube y enviar enlace con botones",
  category: "downloader",
  run: async (client, m, args) => {
    if (!m) return console.log("⚠️ No se recibió el mensaje");

    const chatId = m.chat || m.key?.remoteJid;
    if (!chatId) return console.log("⚠️ No se pudo obtener chatId del mensaje");

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

      // Tomamos el primer resultado
      const video = results[0];
      const caption = 
`🎬 *Título:* ${video.titulo}
📌 *Canal:* ${video.canal}
⏱ *Duración:* ${video.duracion}
👁 *Vistas:* ${video.vistas.toLocaleString()}
🔗 *Enlace:* ${video.url}`;

      // Botones
      const buttons = [
        { buttonId: `.ytaudio ${video.url}`, buttonText: { displayText: '🎵 Audio' }, type: 1 },
        { buttonId: `.ytvideo ${video.url}`, buttonText: { displayText: '🎬 Video' }, type: 1 },
        { buttonId: `.ytdoc ${video.url}`, buttonText: { displayText: '📄 Documento' }, type: 1 }
      ];

      const buttonMessage = {
        image: { url: video.miniatura },
        caption,
        footer: 'DevYER ',
        buttons,
        headerType: 4
      };

      await client.sendMessage(chatId, buttonMessage, { quoted: m });

    } catch (err) {
      console.error("❌ Error al usar API de búsqueda:", err);
      await client.sendMessage(chatId, { text: "❌ Ocurrió un error al buscar la canción." }, { quoted: m });
    }
  }
};
