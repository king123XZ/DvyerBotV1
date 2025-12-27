module.exports = {
  command: ["ytdoc"],
  category: "downloader",

  run: async (client, m, args) => {
    const url = args[0];

    if (!url || !url.startsWith("http")) {
      return m.reply("❌ Enlace de YouTube no válido.");
    }

    // Guardamos el enlace
    global.ytDocCache = global.ytDocCache || {};
    global.ytDocCache[m.sender] = url;

    const buttons = [
      { buttonId: ".ytdocq 360", buttonText: { displayText: "📄 360p" }, type: 1 },
      { buttonId: ".ytdocq 480", buttonText: { displayText: "📄 480p" }, type: 1 },
      { buttonId: ".ytdocq 720", buttonText: { displayText: "📄 720p" }, type: 1 }
    ];

    await client.sendMessage(
      m.chat,
      {
        text: "📥 *Selecciona la calidad del video (DOCUMENTO):*",
        footer: "YerTX Bot",
        buttons,
        headerType: 1
      },
      { quoted: m }
    );
  }
};

