const axios = require('axios');

module.exports = {
  command: ["play", "song"],
  run: async (client, m, args) => {
    const chatId = m.key.remoteJid;
    const query = args.join(" ");

    if (!query) return m.reply("❌ Ingresa el nombre de la canción o enlace.");

    await m.reply("⏳ Buscando...");

    try {
      const res = await axios.get('https://api.neoxr.eu/api/play', {
        params: { q: query, apikey: 'zMqDtV' }
      });

      const song = res.data?.data;
      if (!song || !song.url) return m.reply("❌ No se encontró la canción.");

      const caption = `🎵 ${song.title}\nArtista: ${song.artist}\nDuración: ${song.duration}`;
      
      await client.sendMessage(chatId, {
        image: { url: song.thumbnail },
        caption
      }, { quoted: m });

      await client.sendMessage(chatId, {
        audio: { url: song.url },
        mimetype: "audio/mpeg",
        fileName: `${song.title}.mp3`
      }, { quoted: m });

    } catch (err) {
      console.error("Error al usar Neoxr API:", err);
      m.reply("❌ Ocurrió un error al obtener la canción.");
    }
  }
};


