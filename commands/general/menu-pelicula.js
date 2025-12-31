const movies = require("../lib/movies");

module.exports = {
  command: ["peliculas", "menupeliculas"],
  category: "media",

  run: async (client, m) => {

    // 🧩 Secciones (máx 10)
    const sections = [
      {
        title: "🔥 ANIME / ANIMACIÓN",
        rows: [
          {
            title: "1. Dragon Ball Super: Broly",
            description: "720p Latino",
            rowId: ".pelicula 1"
          },
          {
            title: "2. Kimetsu no Yaiba: Mugen Train",
            description: "720p / 1080p Sub Español",
            rowId: ".pelicula 2"
          },
          {
            title: "8. Pokémon: Detective Pikachu",
            description: "720p Latino",
            rowId: ".pelicula 8"
          }
        ]
      },
      {
        title: "🎬 ACCIÓN / AVENTURA",
        rows: [
          {
            title: "3. Godzilla 2",
            description: "720p Latino",
            rowId: ".pelicula 3"
          },
          {
            title: "4. Aquaman",
            description: "720p Latino (RAM +3GB)",
            rowId: ".pelicula 4"
          },
          {
            title: "5. Shazam!",
            description: "720p Latino",
            rowId: ".pelicula 5"
          },
          {
            title: "6. Sonic: La Película",
            description: "720p Latino",
            rowId: ".pelicula 6"
          },
          {
            title: "7. Bumblebee",
            description: "720p Latino",
            rowId: ".pelicula 7"
          }
        ]
      }
    ];

    const listMessage = {
      text:
        "🎬 *MENÚ DE PELÍCULAS*\n\n" +
        "Selecciona una película para descargar 👇\n\n" +
        "🔐 *Contraseña:* www.blizzboygames.net\n\n" +
        "⚠️ Nota: Descargas grandes requieren buena conexión\n\n" +
        "👑 DevYer",
      footer: "DevYer • Catálogo de Películas",
      title: "🍿 PELÍCULAS DISPONIBLES",
      buttonText: "📂 Ver catálogo",
      sections
    };

    await client.sendMessage(m.chat, listMessage, { quoted: m });
  }
};
