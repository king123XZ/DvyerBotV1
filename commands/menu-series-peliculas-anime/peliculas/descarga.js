// Ajusta la ruta según la ubicación de este archivo
const movies = require("../../../lib/movies"); // 🔹 Ruta corregida
const axios = require("axios");

const API_KEY = "dvyer"; // Tu API Key para el downloader

module.exports = {
  //command: ["verpeliculas"],
  category: "media",

  run: async (client, m) => {
    for (const movie of movies) {
      // Botón para descargar la película
      const buttons = [
        {
          buttonId: `.descargarpelicula ${movie.id}`,
          buttonText: { displayText: "📥 Descargar" },
          type: 1
        }
      ];

      const caption =
        `🎬 *${movie.title}* (${movie.year})\n\n` +
        `📀 *Calidad:* ${movie.quality}\n` +
        `🔊 *Audio:* ${movie.audio}\n` +
        `⏱ *Duración:* ${movie.duration}\n` +
        `🎭 *Género:* ${movie.genre.join(", ")}\n\n` +
        `📝 *Sinopsis:*\n${movie.description}`;

      // Enviar mensaje con imagen y botón
      await client.sendMessage(
        m.chat,
        {
          image: { url: movie.image },
          caption,
          footer: "Killua Bot • DevYer",
          buttons,
          headerType: 4
        },
        { quoted: m, ...global.channelInfo } // ✅ Evita errores de paréntesis
      );
    }
  }
};

// -------------------------
// Comando para descargar la película
// -------------------------
module.exports.descargarpelicula = {
  command: ["descargarpelicula"],
  category: "media",

  run: async (client, m, args) => {
    const movieId = Number(args[0]);
    const movie = movies.find(mv => mv.id === movieId);

    if (!movie) {
      return client.reply(
        m.chat,
        "❌ Película no encontrada.",
        m,
        { ...global.channelInfo } // ✅ Corrección
      );
    }

    await client.reply(
      m.chat,
      `⏳ Descargando *${movie.title}*\nPuede tardar un momento si el archivo es pesado.\n🤖 Bot: KILLUA-BOT v1.00`,
      m,
      { ...global.channelInfo }
    );

    try {
      // Descargar archivo usando Mediafire API
      const res = await axios.get(
        "https://api-adonix.ultraplus.click/download/mediafire",
        { params: { apikey: API_KEY, url: movie.url }, timeout: 0 }
      );

      const file = res.data.result[0];
      if (!file) throw new Error("No se pudo obtener el archivo.");

      const data = await axios.get(file.link, { responseType: "arraybuffer", timeout: 0 });

      // Enviar archivo al chat
      await client.sendMessage(
        m.chat,
        {
          document: Buffer.from(data.data),
          fileName: decodeURIComponent(file.nama),
          mimetype: `application/${file.mime}`,
          caption: `📥 ${movie.title}\n🤖 KILLUA-BOT v1.00`
        },
        { quoted: m, ...global.channelInfo } // ✅ Corrección
      );

    } catch (err) {
      console.error("MOVIE DOWNLOAD ERROR:", err.message);
      await client.reply(
        m.chat,
        "❌ Error al descargar la película.",
        m,
        { ...global.channelInfo }
      );
    }
  }
};

