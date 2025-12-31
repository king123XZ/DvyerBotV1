const movies = require("../../lib/movies");

module.exports = {
  command: ["verpeliculas"],
  category: "media",

  run: async (client, m) => {
    for (const movie of movies) {
      const buttons = [
        {
          buttonId: `.comprar ${movie.id}`,
          buttonText: { displayText: "🛒 Comprar" },
          type: 1
        }
      ];

      await client.sendMessage(
        m.chat,
        {
          image: { url: movie.image }, // 👈 IMAGEN DE LA PELÍCULA
          caption:
            `🎬 *${movie.title}*\n\n` +
            `🔐 Contraseña:\nwww.blizzboygames.net`,
          footer: "Killua Bot • DevYer",
          buttons,
          headerType: 4
        },
        { quoted: m }
      );
    }
  }
};
