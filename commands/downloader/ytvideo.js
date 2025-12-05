const axios = require('axios');

const API_KEY = 'M8EQKBf7LhgH';
const API_SEARCH = 'https://api-sky.ultraplus.click/api/utilidades/ytsearch.js';
const API_DOWNLOAD = 'https://api-sky.ultraplus.click/api/download/yt.js';

// Servidor alterno por si uno cae
const API_BACKUP = 'https://api-ultra.yersonapis.workers.dev/ytvideo';

module.exports = {
  command: ["ytvideo"],
  description: "Descargar un video de YouTube",
  category: "downloader",

  run: async (client, m, args) => {
    const chatId = m?.chat || m?.key?.remoteJid;
    if (!chatId) return;

    if (!args[0]) {
      return client.sendMessage(chatId, { text: "⚠️ Ingresa el nombre del video." }, { quoted: m });
    }

    const query = args.join(" ");

    // Aviso
    await client.sendMessage(chatId, { text: "⏳ *Buscando video...*" }, { quoted: m });

    try {
      // 1️⃣ Buscar video
      const search = await axios.get(API_SEARCH, {
        params: { q: query },
        headers: { Authorization: `Bearer ${API_KEY}` }
      });

      const result = search.data?.Result?.[0];
      if (!result) {
        return client.sendMessage(chatId, { text: "❌ No se encontró ningún video." });
      }

      const videoUrl = result.url;
      const titulo = result.titulo || "video";

      // Aviso de descarga
      await client.sendMessage(chatId, { text: `⬇️ *Descargando:* ${titulo}` }, { quoted: m });

      // 2️⃣ Intento principal
      let res;
      try {
        res = await axios.get(API_DOWNLOAD, {
          params: { url: videoUrl, format: "video" },
          headers: { Authorization: `Bearer ${API_KEY}` },
          responseType: "arraybuffer",
          timeout: 15000
        });

        // A veces la API responde con error en texto aunque sea status 200
        const asText = Buffer.from(res.data).toString();
        if (asText.includes("error") || asText.includes("not available")) {
          throw new Error("Archivo inválido");
        }
      } catch (err) {
        console.log("⚠ Error en servidor principal, usando backup...");

        // 3️⃣ Intento con BACKUP
        const backup = await axios.get(API_BACKUP, {
          params: { url: videoUrl },
          responseType: "arraybuffer",
          timeout: 20000
        });

        res = backup;
      }

      // 4️⃣ Enviar el video
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
      console.log("❌ Error final:", err);
      await client.sendMessage(
        chatId,
        { text: "❌ El video no pudo descargarse. Prueba con otro título o URL." },
        { quoted: m }
      );
    }
  }
};
