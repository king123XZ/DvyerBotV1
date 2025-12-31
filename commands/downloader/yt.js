const axios = require('axios');
const { ytdl } = require('../lib/ytdl');

const MAX_MB = 1500; // 1.5 GB

module.exports = {
  command: ['ytdl', 'yt'],
  category: 'downloader',

  run: async (client, m, args) => {
    try {
      if (args.length < 2) {
        return m.reply(
          `❌ Uso:\n` +
          `!ytdl <url> <360|720>\n\n` +
          `Ejemplo:\n` +
          `!ytdl https://youtu.be/xxxx 360`
        );
      }

      const url = args[0];
      const format = args[1];

      await m.reply('⏳ Descargando video, espera...');

      const res = await ytdl(url, format);
      if (res.error) return m.reply(`❌ Error: ${res.error}`);

      // 🔎 OBTENER PESO DEL ARCHIVO
      const head = await axios.head(res.link, {
        maxRedirects: 5,
        timeout: 20000
      });

      const sizeBytes = parseInt(head.headers['content-length'] || 0);
      const sizeMB = sizeBytes / (1024 * 1024);

      if (!sizeBytes) {
        return m.reply('❌ No se pudo calcular el tamaño del archivo');
      }

      if (sizeMB > MAX_MB) {
        return m.reply(
          `❌ Archivo demasiado pesado\n\n` +
          `📦 Tamaño: ${sizeMB.toFixed(2)} MB\n` +
          `📛 Máximo permitido: ${MAX_MB} MB`
        );
      }

      const caption =
        `🎬 *${res.title || 'Video'}*\n` +
        `📦 Tamaño: ${sizeMB.toFixed(2)} MB\n` +
        `📁 Enviado como documento`;

      // 📤 ENVIAR COMO DOCUMENTO
      await client.sendMessage(m.chat, {
        document: { url: res.link },
        mimetype: 'video/mp4',
        fileName: `${res.title || 'video'}.mp4`,
        caption
      }, { quoted: m });

    } catch (err) {
      console.error(err);
      m.reply('❌ Error al enviar el video');
    }
  }
};
