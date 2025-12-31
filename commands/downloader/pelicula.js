const axios = require("axios");
const movies = require("../../lib/movies");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
const MAX_MB = 1800;

module.exports = {
  command: ["pelicula"],
  category: "downloader",

  run: async (client, m, args) => {

    if (!args[0]) {
      return m.reply("❌ Usa: .pelicula <número>");
    }

    const movie = movies.find(v => v.id == args[0]);
    if (!movie) {
      return m.reply("❌ Película no encontrada.");
    }

    // 🔒 SOLO EN CONSOLA
    console.log("📥 Descargando película");
    console.log("🎬 Título:", movie.title);
    console.log("🔗 killuaVip:", movie.url);

    await client.sendMessage(
      m.chat,
      {
        image: { url: movie.image },
        caption:
          `🎬 *${movie.title}*\n` +
          `🎥 ${movie.quality}\n` +
          `🔐 Contraseña: www.blizzboygames.net\n\n` +
          `⏳ Descargando...`
      },
      { quoted: m }
    );

    try {
      const res = await axios.post(
        "https://api-sky.ultraplus.click/download/mediafire",
        { url: movie.url },
        { headers: { apikey: API_KEY } }
      );

      const file = res.data.result.files[0];

      const stream = await axios.get(file.download, {
        responseType: "arraybuffer",
        timeout: 0
      });

      await client.sendMessage(
        m.chat,
        {
          document: Buffer.from(stream.data),
          mimetype: "application/octet-stream",
          fileName: file.name,
          caption: `🎬 ${movie.title}\n👑 DevYer`
        },
        { quoted: m }
      );

    } catch (err) {
      console.error(" ERROR:", err.message);
      m.reply("❌ Error al descargar la película.");
    }
  }
};
