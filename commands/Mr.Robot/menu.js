const series = require("../../lib/series");

module.exports = {
  command: ["menu_serie"],
  category: "media",
  description: "Muestra el menú de capítulos de la temporada 1",

  run: async (client, m) => {
    const s = series.find(x => x.id === "mr_robot");
    if (!s) return m.reply("❌ Serie no encontrada.");

    const season = s.seasons.find(t => t.season === 1);
    if (!season) return m.reply("❌ Temporada no encontrada.");

    // Construimos la lista (ListMessage)
    const sections = [
      {
        title: `Capítulos de ${s.title} - Temporada 1`,
        rows: season.episodes.map(ep => ({
          title: ep.title,
          rowId: ep.url && ep.url !== "" ? `.mr_robot t1-${ep.ep}` : `no_available_${ep.ep}`,
          description: ep.url && ep.url !== "" ? `📥 Disponible` : `⚠️ No disponible`
        }))
      }
    ];

    const listMessage = {
      text: `📺 *${s.title}* - Temporada 1\nSelecciona un capítulo:`,
      footer: "Killua Bot • DevYer",
      title: "Menú de capítulos",
      buttonText: "Ver capítulos",
      sections
    };

    // Enviar mensaje sin citar, para que funcione en grupos y privados
    await client.sendMessage(m.chat, listMessage);
  }
};
