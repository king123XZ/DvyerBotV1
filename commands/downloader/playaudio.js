const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  command: ["play", "playaudio"],
  description: "Busca en Neoxr y descarga audio con Sky API",
  category: "downloader",
  run: async (client, m, args) => {
    const chatId = m.chat;
    if (!args[0]) return m.reply("Ingresa el nombre de la canción.");

    const query = args.join(" ");
    const SKY_API_KEY = "M8EQKBf7LhgH";
    const TMP_DIR = path.join(__dirname, "../tmp");
    if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

    await m.reply("⏳ Buscando canción...");

    try {
      // 1️⃣ Buscar con Neoxr API
      const searchRes = await axios.get('https://api.neoxr.eu/api/play', {
        params: { q: query, apikey: 'zMqDtV' }
      });

      if (!searchRes.data || !searchRes.data.url) return m.reply("❌ No se encontró la canción.");

      const videoUrl = searchRes.data.url;
      const title = searchRes.data.title;

      await m.reply(`✅ Encontrado: ${title}\n⏳ Descargando audio...`);

      // 2️⃣ Descargar con Sky API
      const downloadRes = await axios.get('https://api-sky.ultraplus.click/api/download/yt.js', {
        params: { url: videoUrl, format: "audio" },
        headers: { Authorization: `Bearer ${SKY_API_KEY}` }
      });

      const audioUrl = downloadRes.data.data?.audio;
      if (!audioUrl) return m.reply("❌ No se pudo obtener el audio desde Sky API.");

      // 3️⃣ Descargar el audio a buffer
      const audioResp = await axios.get(audioUrl, { responseType: 'arraybuffer' });
      const audioBuffer = Buffer.from(audioResp.data);

      // 4️⃣ Enviar a WhatsApp
      await client.sendMessage(chatId, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`
      }, { quoted: m });

    } catch (e) {
      console.error("❌ Error al procesar .play:", e);
      await m.reply("❌ Ocurrió un error al buscar o descargar la canción.");
    }
  }
};

