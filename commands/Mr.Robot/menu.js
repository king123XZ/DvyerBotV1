const series = require("../../lib/series");

module.exports = {
  command: ["mr_robot_menu"],
  category: "media",
  run: async (client, m) => {
    const s = series.find(x => x.id === "mr_robot");
    if (!s) return m.reply("❌ Serie no encontrada.");

    const season = s.seasons[0];

    // Solo primeros 4 capítulos como botones
    const buttons = season.episodes.slice(0, 4).map(ep => ({
      buttonId: `.descarga mr_robot t1-${ep.ep}`,
      buttonText: { displayText: ep.title },
      type: 1,
    }));

    await client.sendMessage(
      m.chat,
      {
        image: { url: s.image },
        caption: `🎬 *${s.title} - Temporada 1*\n\n📌 Selecciona un capítulo (solo 4 botones visibles):\nSi tu capítulo no está en botones, escribe el comando: .descarga mr_robot t1-5`,
        footer: "Killua Bot • DevYer",
        buttons,
        headerType: 4,
      },
      { quoted: m }
    );
  },
};
