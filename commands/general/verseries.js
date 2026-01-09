const series = require("../../lib/series"); 
module.exports = {
  command: ["verseries", "series"],
  category: "media",
  description: "Muestra una lista de series disponibles con detalles y botón",

  run: async (client, m) => {
    for (const serie of series) {
      const buttons = [
        {
          buttonId: `.verserie ${serie.id}`, // comando para ver la serie
          buttonText: { displayText: "▶️ Ver" },
          type: 1
        }
      ];

      const caption =
        `📺 *${serie.title}* (${serie.year})\n\n` +
        `📀 *Calidad:* ${serie.quality}\n` +
        `🔊 *Audio:* ${serie.audio}\n` +
        `⏱ *Temporadas:* ${serie.seasons} | *Episodios:* ${serie.episodes}\n` +
        `🎭 *Género:* ${serie.genre.join(", ")}\n\n` +
        `📝 *Sinopsis:*\n${serie.description}`;

      await client.sendMessage(
        m.chat,
        {
          image: { url: serie.image }, // portada de la serie
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
