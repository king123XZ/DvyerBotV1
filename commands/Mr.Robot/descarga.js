// Comando exclusivo de Killua-BOT DV
// Creador: DVYER

const series = require("../../lib/series");
const axios = require("axios");

module.exports = {
  command: ["mr_robot", "descargar_cap"],
  category: "media",
  description: "Descarga capítulos de la temporada 1",

  run: async (client, m, args) => {
    if (!args[0]) return client.reply(
      m.chat,
      "❌ Debes indicar el capítulo. Ejemplo: .mr_robot t1-1",
      m,
      global.channelInfo
    );

    const [seasonPart, epPart] = args[0].replace("t", "").split("-");
    const epNum = parseInt(epPart);

    const s = series.find(x => x.id === "mr_robot");
    if (!s) return client.reply(
      m.chat,
      "❌ Serie no encontrada.",
      m,
      global.channelInfo
    );

    const season = s.seasons.find(t => t.season === 1);
    if (!season) return client.reply(
      m.chat,
      "❌ Temporada no encontrada.",
      m,
      global.channelInfo
    );

    const ep = season.episodes.find(e => e.ep === epNum);
    if (!ep) return client.reply(
      m.chat,
      "❌ Capítulo no encontrado.",
      m,
      global.channelInfo
    );

    // ⚠ Verificar si el capítulo está disponible
    if (!ep.url || ep.url.includes("xxxx")) {
      return client.reply(
        m.chat,
        "❌ Este capítulo aún no está disponible.",
        m,
        global.channelInfo
      );
    }

    await client.reply(
      m.chat,
      `⏳ Descargando: ${ep.title}`,
      m,
      global.channelInfo
    );

    try {
      // Verificar que la URL existe antes de descargar
      const head = await axios.head(ep.url).catch(() => null);
      if (!head || head.status !== 200) {
        return client.reply(
          m.chat,
          "❌ El capítulo no está disponible en este momento.",
          m,
          global.channelInfo
        );
      }

      // Descargar capítulo
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
        { quoted: m, ...global.channelInfo }
      );

    } catch (err) {
      console.error("DESCARGA ERROR:", err.message);
      await client.reply(
        m.chat,
        "❌ Error al descargar el capítulo. Puede que la URL esté caída.",
        m,
        global.channelInfo
      );
    }
  }
};
