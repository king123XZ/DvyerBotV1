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

    // 1️⃣ Enviar SOLO la imagen
    await client.sendMessage(
      m.chat,
      {
        image: { url: s.image },
        caption: `🎬 *${s.title}*\n📅 ${s.year}\n📀 ${s.quality}\n🔊 ${s.audio}`
      },
      { quoted: m }
    );

    // 2️⃣ Menú largo en TEXTO
    let text = "";
    text += "╔════════════════════╗\n";
    text += "║ 📺 MENÚ DE CAPÍTULOS ║\n";
    text += "╚════════════════════╝\n\n";

    text += `🎭 Género: ${s.genre.join(", ")}\n\n`;

    text += "━━━━━━━━━━━━━━━━━━━━━━\n";
    text += "📁 TEMPORADA 1\n";
    text += "━━━━━━━━━━━━━━━━━━━━━━\n\n";

    for (const ep of s.seasons[0].episodes) {
      if (!ep.url || ep.url === "xxxx") {
        text += `⏳ ${ep.title}\n`;
        text += `🔒 Próximamente\n\n`;
      } else {
        text += `▶️ ${ep.title}\n`;
        text += `📥 Descargar:\n`;
        text += `.descargar ${s.id} t1-${ep.ep}\n\n`;
      }
    }

    text += "══════════════════════\n";
    text += "👨‍💻 CRÉDITOS\n";
    text += "══════════════════════\n";
    text += "🤖 Killua Bot\n";
    text += "🛠️ Dev: DvYerZx\n";
    text += "🌐 GitHub:\n";
    text += "https://github.com/DevYerZx/killua-bot-dev\n\n";
    text += "⭐ Sígueme para más actualizaciones\n";

    await client.sendMessage(
      m.chat,
      { text },
      { quoted: m }
    );
  }
};

