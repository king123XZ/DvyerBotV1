const ytdl = require('ytdl-core');

module.exports = {
  command: ["ytaudio", "yta"],
  description: "Descarga solo el audio exacto de YouTube",
  category: "downloader",
  use: "https://www.youtube.com/",
  run: async (client, m, args) => {
    if (!args[0]) return m.reply("Ingresa el enlace directo de YouTube.");

    try {
      const url = args[0];

      // Verificar que el enlace es válido
      if (!ytdl.validateURL(url)) return m.reply("❌ Enlace de YouTube inválido.");

      await m.reply("⏳ Procesando audio...");

      // Obtener info del video
      const info = await ytdl.getInfo(url);
      const title = info.videoDetails.title;
      const thumbnail = info.videoDetails.thumbnails.pop().url;
      const duration = info.videoDetails.lengthSeconds;

      // Descargar solo audio y enviarlo
      const audioStream = ytdl(url, { filter: 'audioonly' });

      await client.sendMessage(
        m.chat,
        {
          audio: audioStream,
          mimetype: "audio/mpeg",
          fileName: `${title}.mp3`,
          caption: `🎵 YouTube Audio\nTítulo: ${title}\nDuración: ${duration}s`,
          contextInfo: {
            externalAdReply: {
              mediaUrl: url,
              mediaType: 2,
              description: title,
              title,
              thumbnailUrl: thumbnail
            }
          }
        },
        { quoted: m }
      );

    } catch (e) {
      console.error("Error al descargar audio:", e);
      m.reply("❌ Ocurrió un error al descargar el audio de YouTube.");
    }
  },
};
