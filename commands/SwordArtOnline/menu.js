const animeList = require("../../lib/anime");

module.exports = {
  command: ["anime"],
  category: "anime",
  description: "Menú de animes",

  run: async (client, m, args) => {
    if (!args[0]) {
      let text = "╔════════════════════╗\n";
      text += "║ 🍥 MENÚ DE ANIME ║\n";
      text += "╚════════════════════╝\n\n";

      for (const a of animeList) {
        text += `🎌 *${a.title}*\n`;
        text += `.anime ${a.id}\n\n`;
      }

      return client.reply(m.chat, text, m);
    }

    const anime = animeList.find(a => a.id === args[0]);
    if (!anime) {
      return client.reply(m.chat, "❌ Anime no encontrado.", m);
    }

    let text = "╔════════════════════╗\n";
    text += "║ 📺 EPISODIOS ║\n";
    text += "╚════════════════════╝\n\n";

    text += `🎬 *${anime.title}*\n`;
    text += `📅 Año: ${anime.year}\n`;
    text += `📀 Calidad: ${anime.quality}\n`;
    text += `🔊 Audio: ${anime.audio}\n`;
    text += `🎭 Género: ${anime.genre.join(", ")}\n\n`;

    const eps = anime.seasons[0].episodes.filter(
      ep => ep.url && ep.url !== "xxxx"
    );

    for (const ep of eps) {
      text += `▶️ ${ep.title}\n`;
      text += `.anime_dl ${anime.id} ${ep.ep}\n\n`;
    }

    text += "⏳ Más episodios se agregarán con el tiempo.\n\n";
    text += "👨‍💻 *DvYerZx*\n";
    text += "🌐 github.com/DevYerZx/killua-bot-dev";

    await client.sendMessage(
      m.chat,
      {
        image: { url: anime.image },
        caption: text
      },
      { quoted: m }
    );
  }
};
