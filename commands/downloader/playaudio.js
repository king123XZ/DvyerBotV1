const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  command: ["play", "playaudio"],
  description: "Buscar y descargar audio de YouTube usando Sky API",
  category: "downloader",
  run: async (client, m, args) => {
    const chatId = m.chat;
    if (!args[0]) return m.reply("⚠️ Ingresa el nombre de la canción o enlace.");

    const query = args.join(" ");
    const SKY_API_KEY = "M8EQKBf7LhgH";
    const TMP_DIR = path.join(__dirname, "../tmp");
    if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

    await m.reply("⏳ Buscando canción...");

    try {
      // 1️⃣ Buscar con Sky API ytsearch
      const searchRes = await axios.get('https://api-sky.ultraplus.click/api/utilidades/ytsearch.js', {
        params: { q: query },
        headers: { Authorization: `Bearer ${SKY_API_KEY}` }
      });

      const videos = searchRes.data?.data;
      if (!videos || !videos.length) return m.reply("❌ No se encontraron resultados.");

      // Tomar el primer resultado
      const video = videos[0];
      const videoUrl = video.url;
      const title = video.title;

      await m.reply(`✅ Encontrado: ${title}\n⏳ Descargando audio...`);

      // 2️⃣ Descargar audio con Sky API
      const downloadRes = await axios.get('https://api-sky.ultraplus.click/api/download/yt.js', {
        params: { url: videoUrl, format: "audio" },
        headers: { Authorization: `Bearer ${SKY_API_KEY}` }
      });

      const audioUrl = downloadRes.data.data?.audio;
      if (!audioUrl) return m.reply("❌ No se pudo obtener el audio.");

      // 3️⃣ Descargar el audio a buffer
      const audioResp = await axios.get(audioUrl, { responseType: 'arraybuffer' });
      const audioBuffer = Buffer.from(audioResp.data);

      // 4️⃣ Enviar a WhatsApp
      await client.sendMessage(chatId, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`
      }, { quoted: m });

      await m.reply("✅ Audio enviado correctamente.");

    } catch (e) {
      console.error("❌ Error al procesar .play:", e);
      await m.reply("❌ Ocurrió un error al buscar o descargar la canción.");
    }
  }
};


