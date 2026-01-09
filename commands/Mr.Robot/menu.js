const series = require("../../lib/series");

module.exports = {
  command: ["menu_serie"],
  category: "media",
  description: "Muestra los capítulos de la temporada 1 usando lista",

  run: async (client, m, args) => {
    if (!args[0]) return m.reply("❌ Debes indicar el ID de la serie.\nEjemplo: .menu_serie mr_robot");

    const s = series.find(x => x.id === args[0]);
    if (!s) return m.reply("❌ Serie no encontrada.");

    const season = s.seasons.find(t => t.season === 1);
    if (!season) return m.reply("❌ Temporada no encontrada.");

    // Construimos los items de la lista
    const sections = [
      {
        title: `Capítulos de ${s.title} - Temporada 1`,
        rows: season.episodes.map(ep => ({
          title: ep.title,
          rowId: ep.url && ep.url !== "" ? `.${s.id} t1-${ep.ep}` : `no_available_${ep.ep}`,
          description: ep.url && ep.url !== "" ? `📥 Disponible` : `⚠️ No disponible`
        }))
      }
    ];

    const listMessage = {
      text: `📺 *${s.title}* - Temporada 1\nSelecciona un capítulo para descargar:`,
      footer: "Killua Bot • DevYer",
      title: "Menú de capítulos",
      buttonText: "Ver capítulos",
      sections
    };

    await client.sendMessage(m.chat, listMessage, { quoted: m });
  }
};
