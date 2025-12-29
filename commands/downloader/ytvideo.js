module.exports = {
  command: ["ytvideo"],

  run: async (client, m, args) => {
    const url = args[0];

    if (!url || !url.startsWith("http")) {
      return m.reply("❌ Enlace de YouTube no válido.");
    }

    global.ytCache = global.ytCache || {};
    global.ytCache[m.sender] = url;

    const buttons = [
      { buttonId: ".ytq 360", buttonText: { displayText: "🎬 360p" }, type: 1 },
      { buttonId: ".ytq 480", buttonText: { displayText: "🎬 480p" }, type: 1 },
      { buttonId: ".ytq 720", buttonText: { displayText: "🎬 720p" }, type: 1 }
    ];

    await client.sendMessage(m.chat, {
      text: "📥 *Selecciona la calidad del video:*",
      footer: "YerTX Bot",
      buttons,
      headerType: 1
    }, { quoted: m });
  }
};
