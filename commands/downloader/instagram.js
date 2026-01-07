const axios = require("axios");

module.exports = {
  command: ["instavid", "instagram"],
  description: "Descarga videos o imágenes de Instagram",
  category: "downloader",
  use: "instavid <link>",

  run: async (client, m, args) => {
    if (!args.length) return m.reply("❌ Ingresa un enlace de Instagram.");

    const url = args[0];

    try {
      await m.reply("⏳ Procesando tu contenido de Instagram...");

      const { data } = await axios.post(
        "https://api-sky.ultraplus.click/instagram",
        { url },
        { headers: { apikey: "sk_f606dcf6-f301-4d69-b54b-505c12ebec45" } }
      );

      if (!data.status) {
        return m.reply("❌ No se pudo procesar el enlace de Instagram.");
      }

      const items = data.result.media.items;
      if (!items || !items.length) return m.reply("❌ No se encontró contenido.");

      // Crear botones para elegir tipo de contenido
      const buttons = items.map((item, index) => ({
        buttonId: `instagram_${index}`,
        buttonText: { displayText: item.type.toUpperCase() },
        type: 1
      }));

      await client.sendMessage(m.chat, {
        text: "Selecciona el tipo de contenido que deseas descargar:",
        buttons,
        headerType: 1
      });

      // Guardamos temporalmente el contenido para cuando el usuario seleccione
      global.instagramCache = global.instagramCache || {};
      global.instagramCache[m.sender] = items;

    } catch (err) {
      console.error("ERROR INSTAGRAM:", err.response?.data || err.message);
      m.reply("❌ Ocurrió un error al descargar el contenido de Instagram.");
    }
  }
};

// ⚡ Listener global para manejar la selección del botón
// Esto debe estar en tu index.js o archivo principal de eventos del bot
client.ev.on("messages.upsert", async (messageUpdate) => {
  const m = messageUpdate.messages[0];
  if (!m?.buttonsResponseMessage) return;

  const sender = m.key.remoteJid;
  const selectedId = m.buttonsResponseMessage.selectedButtonId;

  if (selectedId.startsWith("instagram_") && global.instagramCache?.[m.sender]) {
    const index = parseInt(selectedId.split("_")[1]);
    const item = global.instagramCache[m.sender][index];

    if (!item) return;

    try {
      const mediaData = await axios.get(item.url, { responseType: "arraybuffer" });
      await client.sendMessage(sender, {
        [item.type]: mediaData.data,
        mimetype: item.type === "video" ? "video/mp4" : "image/jpeg",
        fileName: `instagram_${item.type}.${item.type === "video" ? "mp4" : "jpg"}`,
        caption: `🎬 Contenido de Instagram descargado (${item.type})`
      });

      // Limpiar cache
      delete global.instagramCache[m.sender];
    } catch (err) {
      console.error("ERROR AL ENVIAR CONTENIDO:", err.message);
      await client.sendMessage(sender, { text: "❌ Error al enviar el contenido." });
    }
  }
});
