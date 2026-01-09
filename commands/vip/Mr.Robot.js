const series = require("../../lib/series");

module.exports = {
  command: ["menu_serie"],
  category: "media",
  description: "Muestra los capítulos de la temporada 1",

  run: async (client, m, args) => {
    if (!args[0]) return m.reply("❌ Debes indicar el ID de la serie.\nEjemplo: .menu_serie mr_robot");

    const s = series.find(x => x.id === args[0]);
    if (!s) return m.reply("❌ Serie no encontrada.");

    const season = s.seasons.find(t => t.season === 1); // Solo temporada 1

    let buttons = [];
    for (const ep of season.episodes) {
      buttons.push({
        buttonId: `.${s.id} t1-${ep.ep}`, // formato .mr_robot t1-1
        buttonText: { displayText: ep.title },
        type: 1
      });
    }

    const caption = `📺 *${s.title}* - Temporada 1\nElige un capítulo:`;

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
};
