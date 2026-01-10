const series = require("../../lib/series");

module.exports = {
  command: ["series", "verseries"],
  category: "media",
  description: "Muestra las series disponibles",

  run: async (client, m) => {
    let text = "📺 *SERIES DISPONIBLES*\n\n";

    for (const s of series) {
      text += `🎬 *${s.title}* (${s.year})\n`;
      text += `🆔 ID: ${s.id}\n`;
      text += `📀 Calidad: ${s.quality}\n`;
      text += `🔊 Audio: ${s.audio}\n`;
      text += `🎭 Género: ${s.genre.join(", ")}\n`;
      text += `📝 ${s.description}\n\n`;
      text += `📂 Ver capítulos:\n.menu_serie ${s.id}\n`;
      text += "\n──────────────\n\n";
    }

    await client.reply(m.chat, text, m, global.channelInfo);
  }
};
