module.exports = {
  command: ["ytdoc"],
  category: "downloader",

  run: async (client, m, args) => {
    const url = args[0];

    if (!url || !url.startsWith("http")) {
      return m.reply("❌ Enlace de YouTube no válido.");
    }

    // 📦 Cache por usuario (anti-spam)
    global.ytDocCache = global.ytDocCache || {};
    global.ytDocCache[m.sender] = {
      url,
      time: Date.now()
    };

    const buttons = [
      { buttonId: `.ytdocq 360 ${m.sender}`, buttonText: { displayText: "📄 360p" }, type: 1 },
      { buttonId: `.ytdocq 480 ${m.sender}`, buttonText: { displayText: "📄 480p" }, type: 1 },
      { buttonId: `.ytdocq 720 ${m.sender}`, buttonText: { displayText: "📄 720p HD" }, type: 1 }
    ];

    await client.sendMessage(
      m.chat,
      {
        text: "📥 *Selecciona la calidad del video (DOCUMENTO):*",
        footer: "Killua-Bot V1.00",
        buttons,
        headerType: 1
      },
      { quoted: m }
    );
  }
};


