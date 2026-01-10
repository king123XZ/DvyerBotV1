const axios = require("axios");
const series = require("../../lib/series");

const API_KEY = "dvyer";

module.exports = {
  command: ["descargar", "descarga_cap"],
  category: "media",
  description: "Descarga capítulos de series",

  run: async (client, m, args) => {
    if (!args[0] || !args[1]) {
      return client.reply(
        m.chat,
        "❌ Ejemplo: .descargar mr_robot t1-1",
        m,
        global.channelInfo
      );
    }

    const serieId = args[0];
    const capArg = args[1];

    const [seasonPart, epPart] = capArg.replace("t", "").split("-");
    const seasonNum = parseInt(seasonPart);
    const epNum = parseInt(epPart);

    const s = series.find(x => x.id === serieId);
    if (!s) return client.reply(m.chat, "❌ Serie no encontrada.", m);

    const season = s.seasons.find(t => t.season === seasonNum);
    if (!season) return client.reply(m.chat, "❌ Temporada no encontrada.", m);

    const ep = season.episodes.find(e => e.ep === epNum);
    if (!ep || !ep.url || ep.url.includes("xxxx")) {
      return client.reply(
        m.chat,
        "❌ Este capítulo aún no está disponible.",
        m,
        global.channelInfo
      );
    }

    await client.reply(
      m.chat,
      `⏳ Descargando: *${s.title}* - *${ep.title}*`,
      m,
      global.channelInfo
    );

    try {
      const res = await axios.get(
        "https://api-adonix.ultraplus.click/download/mediafire",
        {
          params: { apikey: API_KEY, url: ep.url },
          timeout: 0
        }
      );

      const file = res.data?.result?.[0];
      if (!file) throw new Error("Archivo no encontrado");

      const download = await axios.get(file.link, {
        responseType: "arraybuffer",
        timeout: 0
      });

      await client.sendMessage(
        m.chat,
        {
          document: Buffer.from(download.data),
          mimetype: `application/${file.mime}`,
          fileName: decodeURIComponent(file.nama),
          caption: `📥 ${s.title} - ${ep.title}`
        },
        { quoted: m, ...global.channelInfo }
      );
    } catch (err) {
      console.error("DESCARGA ERROR:", err.message);
      await client.reply(
        m.chat,
        "❌ Error al descargar el capítulo.",
        m,
        global.channelInfo
      );
    }
  }
};

