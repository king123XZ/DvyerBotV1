const series = require("../../lib/series");
const axios = require("axios");

const API_KEY = "dvyer"; // Tu API key de ADONIX

module.exports = {
  command: ["descargar", "descarga_cap"],
  category: "media",
  description: "Descarga capítulos desde MediaFire",

  run: async (client, m, args) => {
    if (!args[0] || !args[1]) return client.reply(
      m.chat,
      "❌ Debes indicar la serie y el capítulo. Ejemplo: .descargar mr_robot t1-1",
      m,
      global.channelInfo
    );

    const serieId = args[0];
    const capArg = args[1]; // ej: t1-1
    const [seasonPart, epPart] = capArg.replace("t", "").split("-");
    const epNum = parseInt(epPart);

    const s = series.find(x => x.id === serieId);
    if (!s) return client.reply(
      m.chat,
      "❌ Serie no encontrada.",
      m,
      global.channelInfo
    );

    const season = s.seasons.find(t => t.season === parseInt(seasonPart));
    if (!season) return client.reply(
      m.chat,
      "❌ Temporada no encontrada.",
      m,
      global.channelInfo
    );

    const ep = season.episodes.find(e => e.ep === epNum);
    if (!ep || !ep.url || ep.url.includes("xxxx")) return client.reply(
      m.chat,
      "❌ Este capítulo aún no está disponible.",
      m,
      global.channelInfo
    );

    // Mensaje discreto de descarga
    await client.reply(
      m.chat,
      `⏳ Se está descargando: ${s.title} - ${ep.title}\nSe enviará automáticamente cuando esté listo.`,
      m,
      global.channelInfo
    );

    try {
      const res = await axios.get("https://api-adonix.ultraplus.click/download/mediafire", {
        params: { apikey: API_KEY, url: ep.url },
        timeout: 0
      });

      const file = res.data.result[0];
      if (!file) return client.reply(
        m.chat,
        "❌ No se pudo obtener el archivo desde MediaFire.",
        m,
        global.channelInfo
      );

      const download = await axios.get(file.link, { responseType: "arraybuffer", timeout: 0 });
      const buffer = Buffer.from(download.data);

      await client.sendMessage(
        m.chat,
        {
          document: buffer,
          mimetype: `application/${file.mime}`,
          fileName: decodeURIComponent(file.nama),
          caption: `📥 ${s.title} - ${ep.title}`
        },
        { quoted: m, ...global.channelInfo }
      );

    } catch (err) {
      console.error("DESCARGA CAP ERROR:", err.message);
      await client.reply(
        m.chat,
        "❌ Error al descargar el capítulo desde MediaFire.",
        m,
        global.channelInfo
      );
    }
  }
};
