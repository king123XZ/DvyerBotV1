const movies = require("../../lib/movies");

module.exports = {
  command: ["peliculas"],
  category: "media",

  run: async (client, m) => {

    const sections = [
      {
        title: "🎬 PELÍCULAS DISPONIBLES",
        rows: movies.map(movie => ({
          title: `${movie.id}. ${movie.title}`,
          description: movie.quality,
          rowId: `.pelicula ${movie.id}` // 👈 NO HAY LINKS
        }))
      }
    ];

    await client.sendMessage(
      m.chat,
      {
        text:
          "🎬 *MENÚ DE PELÍCULAS*\n\n" +
          "Selecciona una película para descargar.\n\n" +
          "🔐 Contraseña: www.blizzboygames.net\n\n" +
          "👑 DevYer",
        footer: "DevYer • killua Movies",
        title: "🍿 CATÁLOGO",
        buttonText: "📂 Ver películas",
        sections
      },
      { quoted: m }
    );
  }
};
