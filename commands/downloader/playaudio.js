const axios = require('axios');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

const API_KEY = 'M8EQKBf7LhgH';
const API_BASE = 'https://api-sky.ultraplus.click';

module.exports = {
  command: ["play","ytplay","ytaudio"],
  description: "Buscar y descargar audio de YouTube",
  category: "downloader",
  run: async (client, m, args) => {
    const chatId = m.chat;
    if (!args[0]) return m.reply("⚠️ Ingresa el nombre de la canción o enlace.");

    await m.reply("⏳ Buscando la canción...");

    try {
      // 1) Buscar con ytsearch.js
      let search = args.join(" ");
      const searchRes = await axios.get(`${API_BASE}/api/utilidades/ytsearch.js`, {
        params: { q: search },
        headers: { Authorization: `Bearer ${API_KEY}` }
      });
      const videos = searchRes.data?.result;
      if (!videos || videos.length === 0) return m.reply("❌ No se encontraron resultados.");

      const video = videos[0]; // Primer resultado
      const videoUrl = video.url;
      const title = video.title;
      const thumbnail = video.thumbnail;

      await m.reply(`✅ Encontrado: *${title}*\n⏳ Descargando audio...`);

      // 2) Descargar audio con download/yt.js
      const downloadRes = await axios.get(`${API_BASE}/api/download/yt.js`, {
        params: { url: videoUrl, format: 'audio' },
        headers: { Authorization: `Bearer ${API_KEY}` }
      });

      const data = downloadRes.data.data;
      if (!data || !data.audio) return m.reply("❌ No se pudo obtener el audio.");

      // 3) Descargar audio al servidor temporalmente
      const tmpDir = path.join(__dirname, '../tmp');
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

      const audioPath = path.join(tmpDir, `${Date.now()}_in.mp3`);
      const audioResStream = await axios.get(data.audio, { responseType: 'stream' });
      const writer = fs.createWriteStream(audioPath);
      audioResStream.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // 4) Opcional: convertir a mp3 128k si no lo es
      const outPath = path.join(tmpDir, `${Date.now()}_out.mp3`);
      await new Promise((resolve, reject) => {
        ffmpeg(audioPath)
          .audioCodec('libmp3lame')
          .audioBitrate('128k')
          .format('mp3')
          .save(outPath)
          .on('end', resolve)
          .on('error', reject);
      });
      fs.unlinkSync(audioPath); // borrar original
      const finalPath = outPath;

      // 5) Enviar audio a WhatsApp
      const buffer = fs.readFileSync(finalPath);
      await client.sendMessage(chatId, {
        audio: buffer,
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
        caption: `🎵 *${title}*`
      }, { quoted: m });

      fs.unlinkSync(finalPath);

    } catch (err) {
      console.error("❌ Error al usar la API:", err);
      m.reply("❌ Ocurrió un error al procesar la canción.");
    }
  }
};


