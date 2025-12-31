const movies = require("../../lib/movies");

const PER_PAGE = 5; // películas por página

module.exports = {
  command: ["peliculas", "menu-peliculas"],
  category: "media",

  run: async (client, m, args) => {
    const page = parseInt(args[0]) || 1;
    const start = (page - 1) * PER_PAGE;
    const end = start + PER_PAGE;

    const pageMovies = movies.slice(start, end);
    if (!pageMovies.length) {
      return m.reply("❌ No hay más películas.");
    }

    const sectionsMap = {};

    for (const movie of pageMovies) {
      if (!sectionsMap[movie.section]) {
        sectionsMap[movie.section] = [];
      }

      sectionsMap[movie.section].push({
        title: movie.title,
        rowId: `.pelicula ${movie.id}`,
        description: movie.note || "🎬 Descargar"
      });
    }

    const sections = Object.keys(sectionsMap).map(section => ({
      title: section,
      rows: sectionsMap[section]
    }));

    // ➡️ botón más películas
    if (end < movies.length) {
      sections.push({
        title: "➡️ Más películas",
        rows: [
          {
            title: "Ver más títulos",
            rowId: `.peliculas ${page + 1}`,
            description: "📂 Siguiente página"
          }
        ]
      });
    }

    const listMessage = {
      title: "🎬 CATÁLOGO DE PELÍCULAS",
      description:
        `📄 Página ${page}\n\n` +
        "Selecciona una película 👇\n\n" +
        "🔐 Contraseña: www.blizzboygames.net\n" +
        "👑 DevYer",
      buttonText: "📂 Ver catálogo",
      sections
    };

    await client.sendMessage(
      m.chat,
      {
        image: { url: "https://i.ibb.co/r2HCv5s9/killu-peliculas.png" },
        caption: "🍿 *Menú de Películas*",
        footer: "Killua Bot • DevYer",
        listMessage
      },
      { quoted: m }
    );
  }
};
