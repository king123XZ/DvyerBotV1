const axios = require("axios");
const animeList = require("../../lib/anime");

const API_KEY = "dvyer";

module.exports = {
  command: ["sao_dl"],
  category: "anime",

  run: async (client, m, args) => {
    const epNum = Number(args[0]);
    const anime = animeList.find(a => a.id === "sao");

    if (!anime) return client.reply(m.chat, "❌ Anime no encontrado.", m);

    const ep = anime.seasons[0].episodes.find(e => e.ep === epNum);

    if (!ep || ep.url === "xxxx") {
      return client.reply(m.chat, "❌ Episodio no disponible.", m);
    }

    await client.reply(
      m.chat,
      `⏳ Descargando *${anime.title} - ${ep.title}*`,
      m
    );

    const res = await axios.get(
      "https://api-adonix.ultraplus.click/download/mediafire",
      { params: { apikey: API_KEY, url: ep.url } }
    );

    const file = res.data.result[0];
    const data = await axios.get(file.link, { responseType: "arraybuffer" });

    await client.sendMessage(
      m.chat,
      {
        document: Buffer.from(data.data),
        fileName: file.nama,
        mimetype: `application/${file.mime}`
      },
      { quoted: m }
    );
  }
};
