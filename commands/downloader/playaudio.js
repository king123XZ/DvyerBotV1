const axios = require('axios');
const yts = require('yt-search');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { promisify } = require('util');
const { pipeline } = require('stream');
const streamPipeline = promisify(pipeline);

const API_KEY = "M8EQKBf7LhgH"; // Tu API Key
const API_BASE = "https://api-sky.ultraplus.click/api/download/yt.js";

function fileSizeMB(filePath) {
  return fs.statSync(filePath).size / (1024 * 1024);
}

async function downloadToFile(url, filePath) {
  const res = await axios.get(url, { responseType: 'stream' });
  await streamPipeline(res.data, fs.createWriteStream(filePath));
  return filePath;
}

async function convertToMp3(inputPath) {
  const outPath = inputPath.replace(path.extname(inputPath), ".mp3");
  await new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioCodec('libmp3lame')
      .audioBitrate('128k')
      .format('mp3')
      .save(outPath)
      .on('end', resolve)
      .on('error', reject);
  });
  return outPath;
}

module.exports = {
  command: ["youtube", "yt", "ytaudio"],
  description: "Descarga solo el audio de YouTube usando tu API",
  category: "downloader",
  run: async (client, m, args) => {
    if (!args[0]) return m.reply("Ingresa el enlace o el nombre de un video de YouTube.");

    await m.reply("⏳ Buscando y procesando audio...");

    try {
      let videoUrl = args[0];

      // Si no es enlace, buscar con yt-search
      if (!videoUrl.startsWith("http")) {
        const searchRes = await yts(videoUrl);
        if (!searchRes.videos || !searchRes.videos.length) return m.reply("❌ No se encontraron resultados.");
        videoUrl = searchRes.videos[0].url;
      }

      // Llamar a tu API para obtener audio
      const res = await axios.get(API_BASE, {
        params: { url: videoUrl, format: "audio" },
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "X-API-Key": API_KEY
        }
      });

      const data = res.data.data;
      if (!data || !data.audio) return m.reply("❌ No se pudo obtener el audio.");

      // Carpeta temporal
      const tmpDir = path.join(__dirname, "../tmp");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

      const inFile = path.join(tmpDir, `audio_${Date.now()}.mp4`);
      await downloadToFile(data.audio, inFile);

      // Convertir a mp3 si es necesario
      let outFile = inFile;
      if (path.extname(inFile) !== ".mp3") {
        outFile = await convertToMp3(inFile);
        try { fs.unlinkSync(inFile); } catch(e) {}
      }

      // Limitar a 99MB
      if (fileSizeMB(outFile) > 99) {
        try { fs.unlinkSync(outFile); } catch(e) {}
        return m.reply("❌ El archivo es demasiado grande (>99MB).");
      }

      const caption = `🎵 ${data.title || "Audio YouTube"}\nDuración: ${data.duration || "Desconocida"}\n📌 Fuente: YouTube`;

      const buffer = fs.readFileSync(outFile);
      await client.sendMessage(m.chat, {
        audio: buffer,
        mimetype: "audio/mpeg",
        fileName: `${data.title || "audio"}.mp3`,
        caption
      }, { quoted: m });

      try { fs.unlinkSync(outFile); } catch(e) {}

      await client.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (err) {
      console.error("❌ Error al procesar audio de YouTube:", err);
      m.reply("❌ Ocurrió un error al procesar el audio de YouTube.");
    }
  }
};
