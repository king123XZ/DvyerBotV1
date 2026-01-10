module.exports = {
  command: ["peliculas_series"],
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
        buttonText: { displayText: "📺 Series" },
        type: 1
      },
      {
        buttonId: ".anime",
        buttonText: { displayText: "🎌 Anime" },
        type: 1
      },
      {
        buttonId: ".reproductores",
        buttonText: { displayText: "🧩 Archivos para reproducir" },
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
          "👋 *Hola, soy DvYerZx creador del código para Killua Bot*\n\n" +
          "📌 *REQUISITOS IMPORTANTES*\n" +
          "Apoya el proyecto en GitHub para más contenido 👇\n" +
          "🌐 https://github.com/DevYerZx/killua-bot-dev\n\n" +
          "🎬 *Películas:* 2GB – 3GB de RAM\n" +
          "📺 *Series:* 1GB – 2GB de RAM\n" +
          "🎌 *Anime:* 1GB – 2GB de RAM\n\n" +
          "👇 *Selecciona una opción:*",
        footer: "Killua Bot • DevYerZx",
        buttons,
        headerType: 4
      },
      { quoted: m }
    );
  }
};
