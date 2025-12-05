const axios = require('axios');

const API_KEY = 'M8EQKBf7LhgH';
const API_BASE = 'https://api-sky.ultraplus.click';

module.exports = {
  command: ["play","ytsearch","yt"],
  description: "Buscar un video de YouTube y mostrar opciones de descarga",
  category: "downloader",
  run: async (client, m, args) => {
    const chatId = m?.chat || m?.key?.remoteJid;
    if (!chatId) return console.warn("⚠️ No se pudo obtener chatId del mensaje");

    if (!args[0]) {
      return client.sendMessage(chatId, { text: "⚠️ Ingresa el nombre de la canción o artista a buscar." }, { quoted: m });
    }

    const query = args.join(" ");
    await client.sendMessage(chatId, { text: `⏳ Buscando: *${query}* ...` }, { quoted: m });

    try {
      const res = await axios.get(`${API_BASE}/api/utilidades/ytsearch.js`, {
        params: { q: query },
        headers: { Authorization: `Bearer ${API_KEY}` }
      });

      const results = res.data?.Result;
      if (!results || results.length === 0) {
        return client.sendMessage(chatId, { text: "❌ No se encontraron resultados." }, { quoted: m });
      }

      const video = results[0]; // Primer resultado

      const caption = `
🎬 *Título:* ${video.titulo}
📌 *Canal:* ${video.canal}
⏱ *Duración:* ${video.duracion}
👁 *Vistas:* ${video.vistas}
🔗 *Enlace:* ${video.url}
      `.trim();

      // Botones que llaman al código existente directamente
      const buttons = [
        {
          buttonId: `ytAudio_${video.url}`, 
          buttonText: { displayText: "🎵 Descargar Audio" }, 
          type: 1 
        },
        {
          buttonId: `ytVideo_${video.url}`, 
          buttonText: { displayText: "🎥 Descargar Video" }, 
          type: 1 
        },
        {
          buttonId: `ytDocument_${video.url}`, 
          buttonText: { displayText: "📄 Descargar Documento" }, 
          type: 1 
        }
      ];

      const buttonMessage = {
        image: { url: video.miniatura },
        caption,
        footer: "Seleccione una opción de descarga",
        buttons,
        headerType: 4
      };

      await client.sendMessage(chatId, buttonMessage, { quoted: m });

      // Manejo de los botones
      client.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg?.message?.buttonsResponseMessage) return;

        const selectedId = msg.message.buttonsResponseMessage.selectedButtonId;
        const [type, url] = selectedId.split('_'); // ytAudio, ytVideo, ytDocument

        if (type === 'ytAudio') {
          // Llamamos a tu código de ytaudio
          require('./ytaudio.js').run(client, msg, [url]);
        }
        if (type === 'ytVideo') {
          require('./ytvideo.js').run(client, msg, [url]);
        }
        if (type === 'ytDocument') {
          require('./ytdocument.js').run(client, msg, [url]);
        }
      });

    } catch (err) {
      console.error("❌ Error al usar API de búsqueda:", err);
      await client.sendMessage(chatId, { text: "❌ Ocurrió un error al buscar la canción." }, { quoted: m });
    }
  }
};

