const axios = require('axios');

const API_KEY = 'M8EQKBf7LhgH';
const API_BASE = 'https://api-sky.ultraplus.click';

module.exports = {
  command: ["ytvideo"],
  description: "Descarga automáticamente un video de YouTube",
  category: "downloader",
  run: async (client, m, args) => {
    const chatId = m?.chat || m?.key?.remoteJid;
    if (!chatId) return console.warn("⚠️ No se pudo obtener chatId del mensaje");

    if (!args[0]) return client.sendMessage(chatId, { text: "⚠️ Ingresa el nombre de la canción o artista." }, { quoted: m });

    try {
      // Buscar el primer video
      const res = await axios.get(`${API_BASE}/api/utilidades/ytsearch.js`, {
        params: { q: args.join(" ") },
        headers: { Authorization: `Bearer ${API_KEY}` }
      });

      const video = res.data?.Result?.[0];
      if (!video) return client.sendMessage(chatId, { text: "❌ No se encontraron resultados." }, { quoted: m });

      // Mensaje de descarga
      await client.sendMessage(chatId, { text: `⏳ Descargando: *${video.titulo}* ...` }, { quoted: m });

      // Descargar video
      const downloadRes = await axios.get(`${API_BASE}/api/download/yt.js`, {
        params: { url: video.url, format: "video" },
        headers: { Authorization: `Bearer ${API_KEY}`, "X-API-Key": API_KEY }
      });

      const data = downloadRes.data.data;
      if (!data?.video) return client.sendMessage(chatId, { text: "❌ No se pudo obtener el video." }, { quoted: m });

      // Enviar video directamente
      await client.sendMessage(chatId, {
        video: { url: data.video },
        mimetype: "video/mp4",
        fileName: `${video.titulo || "video"}.mp4`,
        caption: `🎬 ${video.titulo}\n📌 Canal: ${video.canal}\n⏱ Duración: ${video.duracion}`
      }, { quoted: m });

    } catch (err) {
      console.error("❌ Error al descargar el video:", err);
      await client.sendMessage(chatId, { text: "❌ Ocurrió un error al descargar el video." }, { quoted: m });
    }
  }
};
