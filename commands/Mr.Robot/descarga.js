const series = require("../../lib/series");
const axios = require("axios");
const MAX_MB = 1800; // límite en MB

module.exports = {
  command: ["descarga"],
  category: "downloader",
  run: async (client, m, args) => {
    if (!args[0] || args[0] !== "mr_robot") return m.reply("❌ Debes indicar la serie.");
    if (!args[1]) return m.reply("❌ Debes indicar el capítulo. Ej: .descarga mr_robot t1-1");

    const s = series.find(x => x.id === "mr_robot");
    const season = s.seasons[0];

    const [seasonPart, epPart] = args[1].replace("t", "").split("-");
    const epNum = parseInt(epPart);

    const ep = season.episodes.find(e => e.ep === epNum);
    if (!ep) return m.reply("❌ Capítulo no encontrado.");
    if (!ep.url || ep.url === "") return m.reply(`⚠️ Capítulo ${ep.title} aún no disponible.`);

    try {
      await m.reply(`⏳ Descargando capítulo ${ep.title}...`);

      const download = await axios.get(ep.url, { responseType: "arraybuffer", timeout: 0 });
      const buffer = Buffer.from(download.data);

      await client.sendMessage(
        m.chat,
        {
          document: buffer,
          fileName: `${s.title} - ${ep.title}.mp4`,
          mimetype: "video/mp4",
          caption: `📥 ${ep.title} - Audio Latino`,
        },
        { quoted: m }
      );
    } catch (err) {
      console.error("MEDIAFIRE ERROR:", err.message);
      m.reply("❌ Error al descargar el capítulo.");
    }
  },
};

