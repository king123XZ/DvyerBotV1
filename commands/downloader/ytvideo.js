const axios = require('axios');

const API_KEY = 'M8EQKBf7LhgH';
const API_BASE = 'https://api-sky.ultraplus.click/api/download/yt.js';

module.exports = {
  command: ["ytvideo"],
  description: "Descargar un video de YouTube",
  category: "downloader",

  run: async (client, m, args) => {
    const chatId = m?.chat || m?.key?.remoteJid;
    if (!chatId) return;

    if (!args[0]) {
      return client.sendMessage(chatId, { text: "⚠️ Ingresa el nombre del video o URL." }, { quoted: m });
    }

    const query = args.join(" ");

    // Notificación inicial
    await client.sendMessage(chatId, { text: "⏳ *Buscando video...*" }, { quoted: m });

    try {
      // 1️⃣ Buscar video en YouTube usando tu API de search
      const search = await axios.get(
        "https://api-sky.ultraplus.click/api/utilidades/ytsearch.js",
        {
          params: { q: query },
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "X-API-Key": API_KEY,
          },
        }
      );

      const result = search.data?.Result?.[0];
      if (!result) {
        return client.sendMessage(chatId, { text: "❌ No se encontró ningún resultado." });
      }

      const videoUrl = result.url;
      const titulo = result.titulo || "video";

      // 2️⃣ Enviar notificación
      await client.sendMessage(
        chatId,
        { text: `⬇️ *Descargando:* ${titulo}` },
        { quoted: m }
      );

      // 3️⃣ Descargar con reintento automático
      const descargarVideo = async () => {
        return await axios.get(API_BASE, {
          params: {
            url: videoUrl,
            format: "video",
          },
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "X-API-Key": API_KEY,
          },
          responseType: "arraybuffer",
          timeout: 15000
        });
      };

      let res;
      try {
        res = await descargarVideo();
      } catch (err) {
        console.log("⚠️ Error, reintentando descarga...");
        res = await descargarVideo();
      }

      // 4️⃣ Enviar video al chat
      await client.sendMessage(
        chatId,
        {
          video: res.data,
          mimetype: "video/mp4",
          fileName: `${titulo}.mp4`,
          caption: `🎬 *${titulo}*`,
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("❌ Error:", err);
      await client.sendMessage(chatId, { text: "❌ Error al procesar el video." });
    }
  },
};

