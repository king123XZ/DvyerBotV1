module.exports = {
  command: ["reproductores", "codecs"],
  category: "general",

  run: async (client, m) => {
    const buttons = [
      {
        buttonId: ".descargar_vlc",
        buttonText: { displayText: "📥 Descargar VLC (APK)" },
        type: 1
      },
      {
        buttonId: ".tutorial_vlc",
        buttonText: { displayText: "🎥 Descargar Tutorial" },
        type: 1
      }
    ];

    await client.sendMessage(
      m.chat,
      {
        image: {
          url: "https://i.ibb.co/rSNgkpm/killua15.jpg"
        },
        caption:
          "╔════════════════════╗\n" +
          "║ 🧩 REPRODUCCIÓN DE VIDEO ║\n" +
          "╚════════════════════╝\n\n" +

          "📌 *Descarga los archivos necesarios para reproducir videos*\n\n" +
          "📥 VLC Media Player (Android)\n" +
          "🎥 Video tutorial paso a paso\n\n" +
          "⚠️ *Los archivos se enviarán automáticamente*\n" +
          "👇 Selecciona una opción:",
        footer: "Killua Bot • DvYerZx",
        buttons,
        headerType: 4
      },
      { quoted: m }
    );
  }
};

