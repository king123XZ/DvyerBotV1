const axios = require('axios');

const API_KEY = 'M8EQKBf7LhgH'; // tu key de Ultraplus
const API_BASE = 'https://api-sky.ultraplus.click';

module.exports = {
  command: ["ytsearch", "play", "yt"],
  description: "Buscar videos de YouTube y enviar enlaces con botones",
  category: "downloader",
  run: async (msg, { conn, args }) => {
    // Validación básica
    if (!args[0]) return conn.sendMessage(msg.key.remoteJid, { text: "⚠️ Ingresa el nombre de la canción o artista a buscar." }, { quoted: msg });

    const query = args.join(" ");
    await conn.sendMessage(msg.key.remoteJid, { text: `⏳ Buscando: *${query}* ...` }, { quoted: msg });

    try {
      // Llamada a la API de búsqueda
      const res = await axios.get(`${API_BASE}/api/utilidades/ytsearch.js`, {
        params: { q: query },
        headers: { Authorization: `Bearer ${API_KEY}` }
      });

      const results = res.data?.Result;
      if (!results || results.length === 0) return conn.sendMessage(msg.key.remoteJid, { text: "❌ No se encontraron resultados." }, { quoted: msg });

      // Tomamos el primer resultado
      const video = results[0];
      const caption = `🎬 *Título:* ${video.titulo}\n📌 *Canal:* ${video.canal}\n⏱ *Duración:* ${video.duracion}\n👁 *Vistas:* ${video.vistas}\n🔗 *Enlace:* ${video.url}`;

      // Botones
      const buttons = [
        { buttonId: `ytaudio ${video.url}`, buttonText: { displayText: "🎵 Audio" }, type: 1 },
        { buttonId: `ytvideo ${video.url}`, buttonText: { displayText: "🎬 Video" }, type: 1 },
        { buttonId: `ytfile ${video.url}`, buttonText: { displayText: "📄 Documento" }, type: 1 }
      ];

      const buttonMessage = {
        image: { url: video.miniatura },
        caption,
        footer: "La Suki Bot",
        buttons,
        headerType: 4
      };

      await conn.sendMessage(msg.key.remoteJid, buttonMessage, { quoted: msg });

    } catch (err) {
      console.error("❌ Error al usar API de búsqueda:", err);
      await conn.sendMessage(msg.key.remoteJid, { text: "❌ Ocurrió un error al buscar la canción." }, { quoted: msg });
    }
  }
};

