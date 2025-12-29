const fs = require("fs");
const path = require("path");

module.exports = {
  command: ["canalbot"],
  description: "Envía el canal oficial del bot con imagen",
  run: async (client, m) => {
    const chatId = m.chat;

    // Ruta de la imagen que se mostrará
    const imageUrl = "https://i.ibb.co/hFDcdpBg/menu.png"; // tu imagen del canal

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
            sourceUrl: "https://whatsapp.com/channel/0029VaH4xpUBPzjendcoBI2c" // enlace directo al canal
          }
        }
      });
    } catch (err) {
      console.error("Error enviando el canal del bot:", err);
      m.reply("❌ Ocurrió un error al enviar el canal del bot.");
    }
  }
};
