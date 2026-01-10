const series = require("../../lib/series");

module.exports = {
  command: ["series", "verseries"],
  category: "media",
  description: "Muestra las series disponibles",

  run: async (client, m) => {
    for (const s of series) {
      const caption =
        `📺 *${s.title}* (${s.year})\n\n` +
        `📀 Calidad: ${s.quality}\n` +
        `🔊 Audio: ${s.audio}\n` +
        `🎭 Género: ${s.genre.join(", ")}\n\n` +
        `📝 ${s.description}`;

      await client.sendMessage(
        m.chat,
        {
          image: { url: s.image },
          caption,
          footer: "Killua Bot • DevYer",
          buttons: [
            {
              buttonId: `.menu_serie ${s.id}`,
              buttonText: { displayText: "📂 Ver capítulos" },
              type: 1
            }
          ],
          headerType: 4
        },
        { quoted: m }
      );
    }
  }
};
