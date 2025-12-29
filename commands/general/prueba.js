const fs = require("fs");
const path = require("path");

module.exports = {
  command: ["canalbot"],
  description: "Envía el canal oficial del bot con imagen",
  run: async (client, m) => {
    const chatId = m.chat;

    // Imagen que se mostrará en el mensaje
    const imageUrl = "https://i.ibb.co/hFDcdpBg/menu.png";

    // Texto que se mostrará
    const text = "📢 ¡Únete al canal oficial del bot!";

    try {
      await client.sendMessage(chatId, {
        image: { url: imageUrl },
        caption: text,
        footer: "YerTX Bot • DVYER",
        headerType: 4,
        contextInfo: {
          externalAdReply: {
            showAdAttribution: true,
            mediaType: 2,
            title: "Canal Oficial del Bot",
            body: "Haz clic y únete al canal",
            thumbnailUrl: imageUrl,
            sourceUrl: "https://github.com/DevYerZx/killua-bot-dev" // Enlace de Bitly
          }
        }
      });
    } catch (err) {
      console.error("Error enviando el canal del bot:", err);
      m.reply("❌ Ocurrió un error al enviar el canal del bot.");
    }
  }
};
