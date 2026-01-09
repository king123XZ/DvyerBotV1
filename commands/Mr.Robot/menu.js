const series = require("../../lib/series");
const downloadMF = require("../../commands/downloader/mediafire");

module.exports = {
  command: ["mr_robot_menu"],
  run: async (client, m) => {
    const s = series.find(x => x.id === "mr_robot");
    if (!s) return m.reply("❌ Serie no encontrada.");

    const season = s.seasons[0];

    // Solo primeros 4 botones (WhatsApp limita)
    const buttons = season.episodes.slice(0, 4).map(ep => ({
      buttonId: `mf_${ep.ep}`, 
      buttonText: { displayText: ep.title },
      type: 1,
    }));

    await client.sendMessage(
      m.chat,
      {
        image: { url: s.image },
        caption: `🎬 *${s.title} - Temporada 1*\n\nPresiona un capítulo para descargar automáticamente.`,
        footer: "Killua Bot • DevYer",
        buttons,
        headerType: 4,
      },
      { quoted: m }
    );
  },
};

// Manejo de botones
client.ev.on("messages.upsert", async ({ messages }) => {
  const m = messages[0];
  if (!m.message?.buttonsResponseMessage) return;

  const buttonId = m.message.buttonsResponseMessage.selectedButtonId;
  if (!buttonId.startsWith("mf_")) return;

  const epNum = parseInt(buttonId.replace("mf_", ""));
  const s = series.find(x => x.id === "mr_robot");
  const season = s.seasons[0];
  const ep = season.episodes.find(e => e.ep === epNum);
  if (!ep?.url) return;

  downloadMF(client, m, ep.url);
});
