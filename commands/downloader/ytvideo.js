module.exports = {
  command: ["ytvideo"],

  run: async (client, m, args) => {
    if (!args[0]) {
      return m.reply("⚠️ Usa: .ytvideo <link de YouTube>");
    }

    const url = args[0];

    const buttons = [
      { buttonId: `.ytq ${url} 360`, buttonText: { displayText: "360p" }, type: 1 },
      { buttonId: `.ytq ${url} 480`, buttonText: { displayText: "480p" }, type: 1 },
      { buttonId: `.ytq ${url} 720`, buttonText: { displayText: "720p" }, type: 1 }
    ];

    await client.sendMessage(
      m.chat,
      {
        text: "🎬 *Elige la calidad del video:*",
        footer: "YerTX Bot",
        buttons,
        headerType: 1
      },
      { quoted: m }
    );
  }
};

