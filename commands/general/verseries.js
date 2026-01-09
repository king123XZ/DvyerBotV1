const series = require("../../lib/series"); // <-- ruta corregida

module.exports = {
  command: ["series", "verseries"],
  category: "media",
  description: "Muestra todas las series disponibles con botón para ver capítulos",

  run: async (client, m) => {
    for (const s of series) {
      const buttons = [
        {
          buttonId: `.mr_robot_menu ${s.id}`,
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
