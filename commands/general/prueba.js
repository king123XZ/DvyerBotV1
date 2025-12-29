const fs = require("fs");
const path = require("path");

module.exports = {
  command: ["vercanal", "canalbot"],
  description: "Envía el canal oficial del bot con botón directo",

  run: async (client, m) => {
    const chatId = m.chat;

    // Imagen que se mostrará en el mensaje
    const imageUrl = "https://i.ibb.co/hFDcdpBg/menu.png";

    // Texto del mensaje
    const text = "📢 ¡Únete al canal oficial del bot!";

    // Botón de URL que redirige al canal
    const buttons = [
      {
        urlButton: {
          displayText: "Ver Canal del Bot",
          url: "https://bit.ly/48XmMCr" // <- Aquí tu enlace de redirección
        }
      }
    ];

    try {
      await client.sendMessage(chatId, {
        image: { url: imageUrl },
        caption: text,
        footer: "YerTX Bot • DVYER",
        buttons: buttons,
        headerType: 4
      });
    } catch (err) {
      console.error("Error enviando el canal del bot:", err);
      m.reply("❌ Ocurrió un error al enviar el canal del bot.");
    }
  }
};

