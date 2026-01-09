const series = require("../../lib/series");

module.exports = {
  command: ["menu_serie"],
  category: "media",
  run: async (client, m) => {
    const s = series.find(x => x.id === "mr_robot");
    if (!s) return m.reply("❌ Serie no encontrada.");

    const season = s.seasons.find(t => t.season === 1);

    // 1️⃣ Opcional: enviar imagen de portada
    await client.sendMessage(
      m.chat,
      {
        image: { url: s.image },
        caption: `📺 ${s.title} - Temporada 1`
      }
    );

    // 2️⃣ Construimos la lista de capítulos
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
      text: `Selecciona un capítulo:`,
      footer: "Killua Bot • DevYer",
      title: "Menú de capítulos",
      buttonText: "Ver capítulos",
      sections
    };

    // 3️⃣ Enviar solo el ListMessage, sin quoted
    await client.sendMessage(m.chat, listMessage);
  }
};
