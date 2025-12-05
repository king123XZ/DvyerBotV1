const axios = require("axios");

const API_KEY = "M8EQKBf7LhgH";
const API_BASE = "https://api-sky.ultraplus.click";

// segunda API de respaldo estable
const BACKUP_API = "https://api.ryzendesu.vip/download/ytmp4?url=";

module.exports = {
  command: ["ytvideo"],
  description: "Descargar video de YouTube con fallback",
  category: "downloader",

  run: async (client, m, args) => {
    const chatId = m?.chat || m?.key?.remoteJid;
    if (!chatId) return console.warn("⚠️ No se pudo obtener chatId del mensaje");

    if (!args[0])
      return client.sendMessage(chatId, { text: "⚠️ Escribe el nombre del video." }, { quoted: m });

    try {
      // Buscar el video
      const r = await axios.get(`${API_BASE}/api/utilidades/ytsearch.js`, {
        params: { q: args.join(" ") },
        headers: { Authorization: `Bearer ${API_KEY}` }
      });

      const video = r.data?.Result?.[0];
      if (!video)
        return client.sendMessage(chatId, { text: "❌ No se encontró ningún video." }, { quoted: m });

      // Aviso de descarga
      await client.sendMessage(chatId, { text: `⏳ Descargando: *${video.titulo}*` }, { quoted: m });

      // Primer intento (API-SKY)
      try {
        const d1 = await axios.get(`${API_BASE}/api/download/yt.js`, {
          params: { url: video.url, format: "video" },
          headers: { Authorization: `Bearer ${API_KEY}` }
        });

        const data = d1.data?.data;
        if (data?.video) {
          return await client.sendMessage(
            chatId,
            {
              video: { url: data.video },
              mimetype: "video/mp4",
              fileName: `${video.titulo}.mp4`,
              caption: `🎬 ${video.titulo}`
            },
            { quoted: m }
          );
        }
      } catch (e) {
        console.log("⚠️ API-SKY falló, usando API de respaldo...");
      }

      // Segundo intento (BACKUP API)
      const d2 = await axios.get(BACKUP_API + video.url);
      if (!d2.data?.result?.url)
        return client.sendMessage(chatId, { text: "❌ Ambas APIs fallaron." }, { quoted: m });

      await client.sendMessage(
        chatId,
        {
          video: { url: d2.data.result.url },
          mimetype: "video/mp4",
          fileName: `${video.titulo}.mp4`,
          caption: `🎬 ${video.titulo}`
        },
        { quoted: m }
      );

    } catch (err) {
      console.log("❌ Error total:", err);
      await client.sendMessage(chatId, { text: "❌ Error inesperado descargando el video." }, { quoted: m });
    }
  }
};
