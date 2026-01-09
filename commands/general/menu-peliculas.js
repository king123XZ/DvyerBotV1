module.exports = {
  command: ["peliculas"],
  category: "general",

  run: async (client, m) => {
    const buttons = [
      {
        buttonId: ".verpeliculas",
        buttonText: { displayText: "🎬 Películas" },
        type: 1
      },
      {
        buttonId: ".series",
        buttonText: { displayText: "SERIES" },
        type: 1
      },
      {
        buttonId: ".anime",
        buttonText: { displayText: "ANIME" },
        type: 1
      }
    ];

    await client.sendMessage(
      m.chat,
      {
        image: {
          url: "https://i.ibb.co/r2HCv5s9/killu-peliculas.png"
        },
        caption:
          "👋 *hola soy dvyer creador del codigo solo echo para killua bot*\n\n" +
           "REQUISITOS PARA PEDIR\n" +
          "Recuerda apoyar mi git para subir mas contenido (https://github.com/DevYerZx/killua-bot-dev)\n" +
          "🎬 Películas en alta calidad(2GB a 3GB de ram)\n" +
          "⚡ Series(1GB A 2GB de ram)\n" +
          "💳 Anime(1GB a 2GB de ram)\n\n" +
          "👇 *Selecciona una opción:*",
        footer: "Killua Bot • DevYer",
        buttons,
        headerType: 4
      },
      { quoted: m }
    );
  }
};
