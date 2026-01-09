const series = require("../../lib/series");

module.exports = {
  command: ["mr_robot"],
  category: "downloader",
  run: async (client, m, args) => {
    if (!args[0]) return m.reply("❌ Debes indicar el capítulo. Ej: .mr_robot 1");

    const s = series.find(x => x.id === "mr_robot");
    if (!s) return m.reply("❌ Serie no encontrada.");

    const season = s.seasons[0];
    const epNum = parseInt(args[0]);
    const ep = season.episodes.find(e => e.ep === epNum);

    if (!ep) return m.reply("❌ Capítulo no encontrado.");
    if (!ep.url || ep.url === "") return m.reply(`⚠️ Capítulo ${ep.title} aún no disponible.`);

    // Envía el comando .mf con el link directamente
    await client.sendMessage(
      m.chat,
      { text: `Para descargar el capítulo ${ep.title}, usa este comando:\n\n.mf ${ep.url}` },
      { quoted: m }
    );
  },
};
