const animeList = require("../../lib/anime");

module.exports = {
  command: ["sao", "sao_menu"],
  category: "anime",
  description: "Menú de Sword Art Online",

  run: async (client, m) => {
    const anime = animeList.find(a => a.id === "sao");
    if (!anime) return client.reply(m.chat, "❌ Anime no encontrado.", m);

    let text = "╔════════════════════╗\n";
    text += "║ ⚔️ SWORD ART ONLINE ║\n";
    text += "╚════════════════════╝\n\n";

    text += `🎬 *${anime.title}*\n`;
    text += `📅 Año: ${anime.year}\n`;
    text += `📀 Calidad: ${anime.quality}\n`;
    text += `🔊 Audio: ${anime.audio}\n`;
    text += `🎭 Género: ${anime.genre.join(", ")}\n\n`;

    text += "━━━━━━━━━━━━━━━━━━━━━━\n";
    text += "📺 *EPISODIOS DISPONIBLES*\n";
    text += "━━━━━━━━━━━━━━━━━━━━━━\n\n";

    const disponibles = anime.seasons[0].episodes.filter(
      ep => ep.url && ep.url !== "xxxx"
    );

    if (!disponibles.length) {
      text += "⏳ Aún no hay episodios disponibles.\n\n";
    } else {
      for (const ep of disponibles) {
        text += `▶️ ${ep.title}\n`;
        text += `.sao_dl ${ep.ep}\n\n`;
      }
    }

    text += "⏳ Los demás episodios se agregarán con el tiempo.\n\n";
    text += "══════════════════════\n";
    text += "👨‍💻 *CRÉDITOS*\n";
    text += "🤖 Bot: Killua Bot\n";
    text += "🛠️ Creador: *DvYerZx*\n";
    text += "🌐 github.com/DevYerZx/killua-bot-dev\n";

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
