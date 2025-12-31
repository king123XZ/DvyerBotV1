const { ytdl } = require('../../lib/ytdl');

module.exports = {
  command: ['yt', 'ytdl'],
  category: 'downloader',

  run: async (client, m, args) => {
    if (!args[0] || !args[1]) {
      return m.reply(
        `❌ Uso incorrecto\n\n` +
        `Ejemplos:\n` +
        `!yt https://youtu.be/xxxx mp3\n` +
        `!yt https://youtu.be/xxxx 360`
      );
    }

    const url = args[0];
    const format = args[1].toLowerCase();

    await m.reply("⏳ Descargando, espera...");

    const res = await ytdl(url, format);

    if (res.error) {
      return m.reply("❌ Error: " + res.error);
    }

    // AUDIO → DOCUMENTO
    if (['mp3','m4a','webm','aac','flac','ogg','wav','apus'].includes(format)) {
      await client.sendMessage(
        m.chat,
        {
          document: { url: res.link },
          mimetype: "audio/mpeg",
          fileName: `${res.title}.mp3`
        },
        { quoted: m }
      );
    } 
    // VIDEO → DOCUMENTO (HASTA 1500 MB)
    else {
      await client.sendMessage(
        m.chat,
        {
          document: { url: res.link },
          mimetype: "video/mp4",
          fileName: `${res.title}.mp4`
        },
        { quoted: m }
      );
    }
  }
};
