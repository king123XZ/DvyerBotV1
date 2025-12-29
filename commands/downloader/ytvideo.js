module.exports = {
  command: ["ytvideo"],
  category: "downloader",

  run: async (client, m, args) => {
    const url = args[0];

    if (!url || !url.startsWith("http")) {
      return m.reply("❌ Enlace de YouTube no válido.");
    }

    // 📦 Cache por usuario (evita spam)
    global.ytCache = global.ytCache || {};
    global.ytCache[m.sender] = {
      url,
      time: Date.now()
    };

    const buttons = [
      { buttonId: `.ytq 144 ${m.sender}`, buttonText: { displayText: "📱 144p" }, type: 1 },
      { buttonId: `.ytq 240 ${m.sender}`, buttonText: { displayText: "📱 240p" }, type: 1 },
      { buttonId: `.ytq 360 ${m.sender}`, buttonText: { displayText: "🎬 360p" }, type: 1 },
      { buttonId: `.ytq 480 ${m.sender}`, buttonText: { displayText: "🎬 480p" }, type: 1 },
      { buttonId: `.ytq 720 ${m.sender}`, buttonText: { displayText: "🎥 720p HD" }, type: 1 }
    ];

    await client.sendMessage(
      m.chat,
      {
        text: "📥 *Selecciona la calidad del video:*",
        footer: "Killua-Bot V1.00",
        buttons,
        headerType: 1
      },
      { quoted: m }
    );
  }
};
