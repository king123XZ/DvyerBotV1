const axios = require("axios");
const animeList = require("../../lib/anime");

const API_KEY = "dvyer";

module.exports = {
  command: ["sao_dl"],
  category: "anime",

  run: async (client, m, args) => {
    const epNum = Number(args[0]);
    const anime = animeList.find(a => a.id === "sao");

    if (!anime)
      return client.reply(
        m.chat,
        "❌ Anime no encontrado.",
        m,
        global.channelInfo
      );

    const ep = anime.seasons[0].episodes.find(e => e.ep === epNum);

    if (!ep || ep.url === "xxxx") {
      return client.reply(
        m.chat,
        "❌ Episodio no disponible.",
        m,
        global.channelInfo
      );
    }

    // Aviso de descarga usando global.channelInfo
    await client.reply(
      m.chat,
      `⏳ Descargando *${anime.title} - ${ep.title}*\nPuede tardar un momento si el archivo es pesado.\n🤖 Bot: KILLUA-BOT v1.00`,
      m,
      global.channelInfo
    );

    try {
      const res = await axios.get(
        "https://api-adonix.ultraplus.click/download/mediafire",
        { params: { apikey: API_KEY, url: ep.url }, timeout: 0 }
      );

      const file = res.data.result[0];
      if (!file) throw new Error("No se pudo obtener el archivo.");

      const data = await axios.get(file.link, { responseType: "arraybuffer", timeout: 0 });

      await client.sendMessage(
        m.chat,
        {
          document: Buffer.from(data.data),
          fileName: decodeURIComponent(file.nama),
          mimetype: `application/${file.mime}`,
          caption: `📥 ${anime.title} - ${ep.title}\n🤖 KILLUA-BOT v1.00`
        },
        { quoted: m, ...global.channelInfo }
      );
    } catch (err) {
      console.error("SAO DOWNLOAD ERROR:", err.message);
      await client.reply(
        m.chat,
        "❌ Error al descargar el episodio.",
        m,
        global.channelInfo
      );
    }
  }
};
