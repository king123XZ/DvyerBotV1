module.exports = {
  command: ["reproductores", "codecs"],
  category: "general",
  description: "Archivos necesarios para reproducir los videos",

  run: async (client, m) => {
    const text =
      "╔════════════════════╗\n" +
      "║ 🧩 REPRODUCCIÓN DE VIDEO ║\n" +
      "╚════════════════════╝\n\n" +

      "📌 *Recomendaciones para reproducir correctamente*\n\n" +

      "▶️ *PC / Laptop*\n" +
      "✔️ VLC Media Player (RECOMENDADO)\n" +
      "https://www.videolan.org/vlc/\n\n" +

      "▶️ *Android*\n" +
      "✔️ VLC for Android\n" +
      "✔️ MX Player\n\n" +

      "▶️ *Formatos usados*\n" +
      "📁 MP4 (H.264 / H.265)\n" +
      "🔊 Audio AAC / MP3\n\n" +

      "⚠️ *IMPORTANTE*\n" +
      "Si el video no reproduce, asegúrate de:\n" +
      "✔️ Tener espacio suficiente\n" +
      "✔️ Usar un reproductor actualizado\n\n" +

      "══════════════════════\n" +
      "👨‍💻 *CRÉDITOS*\n" +
      "🤖 Killua Bot\n" +
      "🛠️ Dev: *DvYerZx*\n" +
      "🌐 github.com/DevYerZx/killua-bot-dev";

    await client.sendMessage(
      m.chat,
      { text },
      { quoted: m }
    );
  }
};
