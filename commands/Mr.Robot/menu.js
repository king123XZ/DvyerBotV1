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
    if (!s) return client.reply(m.chat, "❌ Serie no encontrada.", m);

    let text = `📺 *${s.title}* – Temporada 1\n`;
    text += `📀 ${s.quality} | 🔊 ${s.audio}\n\n`;

    for (const ep of s.seasons[0].episodes) {
      if (!ep.url || ep.url.includes("xxxx")) {
        text += `⏳ ${ep.title}\nPróximamente\n\n`;
      } else {
        text += `▶️ ${ep.title}\n`;
        text += `.descargar ${s.id} t1-${ep.ep}\n\n`;
      }
    }

    await client.sendMessage(
      m.chat,
      {
        image: { url: s.image },
        caption: text
      },
      { quoted: m }
    );
  }
};

