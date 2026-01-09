const series = require("../../lib/series"); // <-- ruta corregida

module.exports = {
  command: ["menu_serie"],
  category: "media",
  description: "Muestra los capítulos de la serie con botones de descarga",

  run: async (client, m, args) => {
    if (!args[0]) return client.reply(
      m.chat,
      "❌ Debes indicar el ID de la serie.\nEjemplo: .menu_serie mr_robot",
      m,
      global.channelInfo
    );

    const s = series.find(x => x.id === args[0]);
    if (!s) return client.reply(
      m.chat,
      "❌ Serie no encontrada.",
      m,
      global.channelInfo
    );

    const season = s.seasons.find(t => t.season === 1);
    if (!season) return client.reply(
      m.chat,
      "❌ Temporada no encontrada.",
      m,
      global.channelInfo
    );

    const buttons = season.episodes.map(ep => ({
      buttonId: `.descargar ${s.id} t1-${ep.ep}`,
      buttonText: { displayText: ep.title },
      type: 1
    }));

    const caption = `📺 *${s.title}* - Temporada 1\nElige un capítulo para descargar:\n\n⚠️ Se enviará un mensaje indicando que se está descargando y luego se enviará el capítulo.`;

    await client.sendMessage(
      m.chat,
      {
        image: { url: s.image },
        caption,
        footer: "Killua Bot • DevYer",
        buttons,
        headerType: 4
      },
      { quoted: m }
    );
  }
};
