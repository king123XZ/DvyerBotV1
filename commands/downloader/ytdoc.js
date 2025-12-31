module.exports = {
  //command: ["ytdoc"],
  category: "downloader",

  run: async (client, m, args) => {
    const url = args[0];

    if (!url || !url.startsWith("http")) {
      return m.reply("❌ Enlace de YouTube no válido.");
    }

    // 📦 Guardar cache
    if (!global.ytDocCache) global.ytDocCache = {};
    global.ytDocCache[m.sender] = {
      url,
      time: Date.now()
    };

    // 🚀 Llamar directamente al comando automático
    await m.reply(
      "📥 Enlace recibido\n" +
      "🎥 Calidad automática: *hasta 360p*\n" +
      "⏱️ Tiempo estimado: *15–30 segundos*"
    );

    // Ejecuta el otro comando sin botones
    await client.emit("command", {
      command: "ytdocq",
      sender: m.sender,
      chat: m.chat,
      quoted: m
    });
  }
};