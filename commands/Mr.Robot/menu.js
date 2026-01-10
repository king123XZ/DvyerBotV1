const series = require("../../lib/series");

module.exports = {
  command: ["menu_serie"],
  category: "media",
  description: "Muestra los capítulos disponibles",

  run: async (client, m, args) => {
    if (!args[0]) {
      return client.reply(
        m.chat,
        "❌ Usa: .menu_serie mr_robot",
        m,
        global.channelInfo
      );
    }

    const s = series.find(x => x.id === args[0]);
    if (!s) {
      return client.reply(m.chat, "❌ Serie no encontrada.", m);
    }

    let text = `📺 *${s.title}*\n`;
    text += `📀 ${s.quality} | 🔊 ${s.audio}\n\n`;

    for (const season of s.seasons) {
      text += `📁 *Temporada ${season.season}*\n\n`;

      for (const ep of season.episodes) {
        text += `▶️ ${ep.title}\n`;
        text += `.descargar ${s.id} t${season.season}-${ep.ep}\n\n`;
      }
    }

    await client.reply(m.chat, text, m, global.channelInfo);
  }
};
