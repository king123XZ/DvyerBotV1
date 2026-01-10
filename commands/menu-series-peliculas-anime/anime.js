const animeList = require("../../lib/anime");

module.exports = {
  command: ["anime", "animes"],
  category: "anime",
  description: "Muestra los animes disponibles",

  run: async (client, m) => {
    for (const a of animeList) {
      const buttons = [
        {
          buttonId: `.${a.id}`,
          buttonText: { displayText: "📺 Ver Episodios" },
          type: 1
        }
      ];

      const caption =
        `🎌 *${a.title}* (${a.year})\n\n` +
        `📀 Calidad: ${a.quality}\n` +
        `🔊 Audio: ${a.audio}\n` +
        `🎭 Género: ${a.genre.join(", ")}\n\n` +
        `📝 Sinopsis:\n${a.description}`;

      await client.sendMessage(
        m.chat,
        {
          image: { url: a.image },
          caption,
          footer: "Killua Bot • DvYerZx",
          buttons,
          headerType: 4
        },
        { quoted: m }
      );
    }
  }
};
