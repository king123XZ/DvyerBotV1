const fs = require("fs");
const path = require("path");

module.exports = {
  command: ["menu_descargas"],
  description: "Muestra el menú de descargas",
  run: async (client, m) => {

    const text = `
⧼ killua-bot V1.00 - 𝗗𝗘𝗦𝗖𝗔𝗥𝗚𝗔𝗦 ⧽
creador dev yer
──────────────────

📥 Comandos disponibles:

• ytaudio → Descargar música de YouTube url
• ytvideo → Descargar video de YouTube url
• ytdoc → Descargar video documento de YouTube url
• spotify → Escribe nombre de la canción 
• play → Descargar música y videos (recomendado)
• tiktok → Descargar video de TikTok
• facebook → Descargar video de Facebook
• mediafire - mf  URL → Descargar archivo de mediafire

──────────────────────────────
🔹 Navega usando los botones:
`;

    // Botones del menú
    const buttons = [
      { buttonId: ".menu_utilidades", buttonText: { displayText: "🛠 Utilidades" }, type: 1 },
      { buttonId: ".menu_infobot", buttonText: { displayText: "🤖 InfoBot" }, type: 1 },
      { buttonId: ".menu", buttonText: { displayText: "🏠 Menú Principal" }, type: 1 },
      {
        urlButton: {
          displayText: "📢 Canal de Bot",
          url: global.my.ch || "https://whatsapp.com/channel/0029VaH4xpUBPzjendcoBI2c"
        }
      }
    ];

    // Ruta de la imagen local
    const imagePath = path.join(__dirname, "..", "..", "imagenesDvYer", "menu-descarga.png");

    if (!fs.existsSync(imagePath)) {
      return m.reply("❌ La imagen del menú de descargas no se encontró. Verifica la ruta y el nombre del archivo.");
    }

    try {
      await client.sendMessage(m.chat, {
        image: { url: imagePath },
        caption: text,
        footer: "YerTX Bot",
        buttons: buttons,
        headerType: 4
      });
    } catch (error) {
      console.error("Error enviando menú de descargas:", error);
      m.reply("❌ Ocurrió un error al enviar el menú de descargas.");
    }
  }
};
