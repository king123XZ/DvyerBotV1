const series = require("../../lib/series");

module.exports = {
  command: ["verseries", "series"],
  category: "media",
  description: "Muestra series y permite abrir menú de capítulos",

  run: async (client, m) => {
    for (const s of series) {
      const buttons = [
        {
          buttonId: `.menu_serie ${s.id}`, // comando para mostrar capítulos
          buttonText: { displayText: "📺 Ver Capítulos" },
          type: 1
        }
      ];

      const caption =
        `📺 *${s.title}* (${s.year})\n` +
        `📀 Calidad: ${s.quality}\n` +
        `🔊 Audio: ${s.audio}\n` +
        `🎭 Género: ${s.genre.join(", ")}\n\n` +
        `📝 Sinopsis:\n${s.description}`;

      await client.sendMessage(
        m.chat,
        {
          image: { url: s.image },
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
