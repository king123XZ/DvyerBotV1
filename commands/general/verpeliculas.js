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
