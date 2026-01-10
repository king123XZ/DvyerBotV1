const movies = require("../../lib/movies");
const axios = require("axios");

const API_KEY = "dvyer"; 

module.exports = {
  command: ["verpeliculas"],
  category: "media",

  run: async (client, m) => {
    for (const movie of movies) {

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

      await client.sendMessage(
        m.chat,
        {
          image: { url: movie.image },
          caption,
          footer: "Killua Bot • DevYer",
          buttons,
          headerType: 4
        },
        { quoted: m }
      );
    }
  }
};


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
        global.channelInfo
