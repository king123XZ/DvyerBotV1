const axios = require('axios');

const API_KEY = 'M8EQKBf7LhgH';
const API_BASE = 'https://api-sky.ultraplus.click';

module.exports = {
  command: ["ytvideo"],
  description: "Descarga un video de YouTube directamente",
  category: "downloader",
  run: async (client, m, args) => {
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
    await client.sendMessage(chatId, { text: `⏳ Buscando video: *${query}* ...` }, { quoted: m });

    try {
      // Buscar el video
      const res = await axios.get(`${API_BASE}/api/utilidades/ytsearch.js`, {
        params: { q: query },
        headers: { Authorization: `Bearer ${API_KEY}` }
      });

      const results = res.data?.Result;
      if (!results || results.length === 0) {
        return client.sendMessage(chatId, { text: "❌ No se encontraron resultados." }, { quoted: m });
      }

      const video = results[0]; // Primer resultado

      // Aviso de descarga
      await client.sendMessage(chatId, { text: `⏳ Descargando video: *${video.titulo}* ...` }, { quoted: m });

      // Llamada a la API de descarga
      const downloadRes = await axios.get(`${API_BASE}/api/download/yt.js`, {
        params: { url: video.url, format: "video" },
        headers: { Authorization: `Bearer ${API_KEY}`, "X-API-Key": API_KEY }
      });

      const data = downloadRes.data.data;
      if (!data || !data.video) {
        return client.sendMessage(chatId, { text: "❌ No se pudo obtener el video." }, { quoted: m });
      }

      // Enviar video
      await client.sendMessage(chatId, {
        video: { url: data.video },
        mimetype: "video/mp4",
        fileName: `${video.titulo || "video"}.mp4`,
        caption: `🎬 *${video.titulo}*\n📌 Canal: ${video.canal}\n⏱ Duración: ${video.duracion}`
      }, { quoted: m });

    } catch (err) {
      console.error("❌ Error al descargar el video:", err);
      await client.sendMessage(chatId, { text: "❌ Ocurrió un error al descargar el video." }, { quoted: m });
    }
  }
};
