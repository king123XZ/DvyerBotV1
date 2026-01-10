const series = require("../../lib/series");

module.exports = {
  command: ["menu_serie"],
  //categoria: "serie",
  description: "Muestra los capítulos disponibles de la serie",

  run: async (client, m, args) => {
    if (!args[0]) {
      return client.reply(
        m.chat,
        "❌ Usa el comando así:\n.menu_serie mr_robot",
        m,
        global.channelInfo
      );
    }

    const s = series.find(x => x.id === args[0]);
    if (!s) {
      return client.reply(
        m.chat,
        "❌ Serie no encontrada.",
        m,
        global.channelInfo
      );
    }

    let text = "";
    text += "╔════════════════════╗\n";
    text += "║ 📺 MENÚ DE CAPÍTULOS ║\n";
    text += "╚════════════════════╝\n\n";

    text += `🎬 *${s.title}*\n`;
    text += `📅 Año: ${s.year}\n`;
    text += `📀 Calidad: ${s.quality}\n`;
    text += `🔊 Audio: ${s.audio}\n`;
    text += `🎭 Género: ${s.genre.join(", ")}\n\n`;

    text += "━━━━━━━━━━━━━━━━━━━━━━\n";
    text += "📁 TEMPORADA 1\n";
    text += "━━━━━━━━━━━━━━━━━━━━━━\n\n";

    // 👉 SOLO capítulos disponibles
    const disponibles = s.seasons[0].episodes.filter(
      ep => ep.url && ep.url !== "xxxx"
    );

    for (const ep of disponibles) {
      text += `▶️ *${ep.title}*\n`;
      text += `📥 Descargar:\n`;
      text += `.descargar ${s.id} t1-${ep.ep}\n\n`;
    }

    text += "━━━━━━━━━━━━━━━━━━━━━━\n";
    text += "⏳ *Más capítulos se agregarán con el transcurso del tiempo.*\n";
    text += "📢 Mantente atento a futuras actualizaciones.\n\n";

    text += "══════════════════════\n";
    text += "👨‍💻 CRÉDITOS\n";
    text += "══════════════════════\n";
    text += "🤖 *Killua Bot*\n";
    text += "🛠️ Creador: *DvYerZx*\n";
    text += "🌐 GitHub:\n";
    text += "https://github.com/DevYerZx/killua-bot-dev\n";

    await client.sendMessage(
      m.chat,
      {
        image: { url: s.image },
        caption: text,
        footer: "Killua Bot • DevYer",
        headerType: 4
      },
      {
        quoted: m,
        ...global.channelInfo
      }
    );
  }
};

