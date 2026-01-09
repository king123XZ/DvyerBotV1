const series = require("../../lib/series");
const axios = require("axios");

module.exports = {
  command: ["mr_robot", "descargar_cap"],
  category: "media",
  description: "Descarga capítulos de Mr. Robot temporada 1",

  run: async (client, m, args) => {
    if (!args[0]) return m.reply("❌ Debes indicar el capítulo. Ejemplo: .mr_robot t1-1");

    const [seasonPart, epPart] = args[0].replace("t", "").split("-");
    const epNum = parseInt(epPart);

    const s = series.find(x => x.id === "mr_robot");
    if (!s) return m.reply("❌ Serie no encontrada.");

    const season = s.seasons.find(t => t.season === parseInt(seasonPart));
    if (!season) return m.reply("❌ Temporada no encontrada.");

    const ep = season.episodes.find(e => e.ep === epNum);
    if (!ep) return m.reply("❌ Capítulo no encontrado.");

    if (!ep.url || ep.url === "") {
      return m.reply(`⚠️ Capítulo ${ep.title} aún no disponible.`);
    }

    await m.reply(`⏳ Descargando: ${ep.title}`);

    try {
      const download = await axios.get(ep.url, { responseType: "arraybuffer", timeout: 0 });
      const buffer = Buffer.from(download.data);

      await client.sendMessage(
        m.chat,
        {
          document: buffer,
          fileName: `${s.title} - ${ep.title}.mp4`,
          mimetype: "video/mp4",
          caption: `📥 ${ep.title} - Audio Latino`
        },
        { quoted: m }
      );
    } catch (err) {
      console.error("DESCARGA ERROR:", err.message);
      m.reply("❌ Error al descargar el capítulo.");
    }
  }
};
