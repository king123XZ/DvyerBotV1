const movies = require("../../lib/movies");

module.exports = {
  command: ["peliculas"],
  category: "media",

  run: async (client, m) => {
    try {
      const sections = [
        {
          title: "🎬 PELÍCULAS DISPONIBLES",
          rows: movies.map(movie => ({
            title: `${movie.id}. ${movie.title}`,
            description: movie.quality,
            rowId: `.pelicula ${movie.id}`
          }))
        }
      ];

      await client.sendMessage(
        m.chat,
        {
          text: "🎬 *MENÚ DE PELÍCULAS*\n\nSelecciona una película 👇\n\n🔐 Contraseña: www.blizzboygames.net\n👑 DevYer",
          footer: "DevYer • MediaFire",
          title: "🍿 CATÁLOGO",
          buttonText: "📂 Ver películas",
          sections: sections
        },
        { quoted: m }
      );

    } catch (e) {
      console.error("ERROR MENU PELICULAS:", e);
      m.reply("❌ Error al mostrar el menú de películas.");
    }
  }
};
