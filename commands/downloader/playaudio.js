const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

module.exports = {
  command: ["play"],
  description: "Descarga audio usando Neoxr API (transcodificado a MP3 válido)",
  run: async (client, m, args) => {
    const chatId = m.key.remoteJid;
    const query = args.join(" ");
    const pref = global.prefixes?.[0] || ".";

    if (!query) return client.sendMessage(chatId, { text: `⚠️ Uso:\n${pref}play <canción>` }, { quoted: m });

    await client.sendMessage(chatId, { react: { text: "⏳", key: m.key } });

    try {
      // Llamada a Neoxr API
      const res = await axios.get("https://api.neoxr.eu/api/play", {
        params: { q: query, apikey: "zMqDtV" },
        timeout: 60000
      });

      const data = res.data?.data;
      if (!res.data?.status || !data || !data.url) throw new Error("No se encontró la canción.");

      const { title, artist, url: audioUrl, thumbnail, duration } = data;

      // Carpeta temporal
      const tmpDir = path.join(__dirname, '../tmp');
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

      const inputPath = path.join(tmpDir, `${Date.now()}_input`);
      const outputPath = path.join(tmpDir, `${Date.now()}_${title}.mp3`);

      // Descarga a archivo temporal
      const audioRes = await axios.get(audioUrl, { responseType: 'stream', timeout: 120000 });
      const writer = fs.createWriteStream(inputPath);
      audioRes.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // Transcodifica a MP3 válido
      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .audioCodec('libmp3lame')
          .audioBitrate('128k')
          .format('mp3')
          .save(outputPath)
          .on('end', resolve)
          .on('error', reject);
      });

      // Enviar audio
      await client.sendMessage(chatId, {
        audio: fs.readFileSync(outputPath),
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
        caption: `🎵 ${title} - ${artist}\nDuración: ${duration || "Desconocida"}`
      }, { quoted: m });

      // Limpieza
      try { fs.unlinkSync(inputPath); } catch {}
      try { fs.unlinkSync(outputPath); } catch {}

      await client.sendMessage(chatId, { react: { text: "✅", key: m.key } });

    } catch (err) {
      console.error("❌ Error al usar Neoxr API:", err);
      await client.sendMessage(chatId, { text: `❌ Error: ${err.message}` }, { quoted: m });
      await client.sendMessage(chatId, { react: { text: "❌", key: m.key } });
    }
  }
};


