const series = require("../../lib/series");

module.exports = {
  command: ["menu_serie", "mr_robot_menu"],
  category: "media",
  description: "Muestra la lista de capítulos de Mr. Robot temporada 1",

  run: async (client, m) => {
    const s = series.find(x => x.id === "mr_robot");
    if (!s) return m.reply("❌ Serie no encontrada.");

    const season = s.seasons.find(t => t.season === 1);
    if (!season) return m.reply("❌ Temporada no encontrada.");

    // 1️⃣ Enviar la imagen de portada
    await client.sendMessage(
      m.chat,
      {
        image: { url: s.image },
        caption: `📺 *${s.title}* - Temporada 1`
      }
    );

    // 2️⃣ Construir el mensaje de capítulos
    let msg = `🎬 *${s.title}* - Temporada 1\n\n📖 Lista de capítulos:\n\n`;

    season.episodes.forEach(ep => {
      const status = ep.url && ep.url !== "" ? "📥 Disponible" : "⚠️ No disponible";
      msg += `${ep.ep}. ${ep.title} - Comando: *${ep.url && ep.url !== "" ? `.mr_robot t1-${ep.ep}` : "No disponible"}* - ${status}\n`;
    });

    msg += `\nEscribe el comando del capítulo que quieres descargar.`;

    // 3️⃣ Enviar mensaje de texto con lista de capítulos
    await client.sendMessage(m.chat, { text: msg });
  }
};

