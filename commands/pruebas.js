
const { ytdl } = require('../lib/ytdl');

module.exports = {
  command: ['ytdl', 'yt'],
  category: 'downloader',

  run: async (client, m, args) => {
    try {
      if (args.length < 2) {
        return m.reply(
          `❌ Uso incorrecto\n\n` +
          `Ejemplo:\n` +
          `!ytdl https://youtu.be/xxxx 360\n` +
          `!ytdl https://youtu.be/xxxx mp3`
        );
      }

      const url = args[0];
      const format = args[1].toLowerCase();

      await m.reply('⏳ Procesando descarga, espera...');

      const res = await ytdl(url, format);

      if (res.error) {
        return m.reply(`❌ Error: ${res.error}`);
      }

      const caption =
        `🎬 *${res.title || 'Sin título'}*\n` +
        `📦 Formato: *${format}*`;

      // AUDIO
      if (['mp3','m4a','webm','aac','flac','ogg','wav','apus'].includes(format)) {
        await client.sendMessage(m.chat, {
          audio: { url: res.link },
          mimetype: 'audio/mpeg'
        }, { quoted: m });

      // VIDEO
      } else {
        await client.sendMessage(m.chat, {
          video: { url: res.link },
          caption
        }, { quoted: m });
      }

    } catch (err) {
      console.error(err);
      m.reply('❌ Error inesperado');
    }
  }
};