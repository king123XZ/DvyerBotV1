const series = require("../../lib/series");

module.exports = {
  command: ["menu_serie"],
  category: "media",
  description: "Muestra los capítulos disponibles con diseño",

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
    text += "║ 📺 *MENÚ DE CAPÍTULOS* ║\n";
    text += "╚════════════════════╝\n\n";

    text += `🎬 *${s.title}*\n`;
    text += `📅 Año: ${s.year}\n`;
    text += `📀 Calidad: ${s.quality}\n`;
    text += `🔊 Audio: ${s.audio}\n`;
    text += `🎭 Género: ${s.genre.join(", ")}\n\n`;

    text += "━━━━━━━━━━━━━━━━━━━━━━\n";
    text += "📁 *TEMPORADA 1*\n";
    text += "━━━━━━━━━━━━━━━━━━━━━━\n\n";

    for (const ep of s.seasons[0].episodes) {
      if (!ep.url || ep.url.includes("xxxx")) {
        text += `⏳ *${ep.title}*\n`;
        text += "🔒 Próximamente\n\n";
      } else {
        text += `▶️ *${ep.title}*\n`;
        text += `📥 Descargar:\n`;
        text += `.descargar ${s.id} t1-${ep.ep}\n\n`;
      }
    }

    text += "══════════════════════\n";
    text += "👨‍💻 *CRÉDITOS*\n";
    text += "══════════════════════\n";
    text += "🤖 Bot: *Killua Bot*\n";
    text += "🛠️ Creador: *DvYerZx*\n";
    text += "🌐 GitHub:\n";
    text += "https://github.com/DevYerZx/killua-bot-dev\n\n";

    text += "⚠️ *Nota:*\n";
    text += "Los capítulos marcados como *Próximamente* se habilitarán cuando estén disponibles.\n";

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
