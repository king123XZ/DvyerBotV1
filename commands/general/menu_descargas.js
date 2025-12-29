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

    const buttons = [
      { buttonId: ".menu_utilidades", buttonText: { displayText: "🛠 Utilidades" }, type: 1 },
      { buttonId: ".menu_infobot", buttonText: { displayText: "🤖 InfoBot" }, type: 1 },
      { buttonId: ".menu", buttonText: { displayText: "🏠 Menú Principal" }, type: 1 },
      {
        urlButton: {
          displayText: "📢 Mi Canal",
          url: global.my.ch // Aquí usamos tu global con el enlace del canal
        }
      }
    ];

    // 📷 Ruta de la imagen local
    const imagePath = path.join(__dirname, "..", "..", "imagenesDvYer", "menu-descarga.png");

    // Verificar si existe el archivo antes de enviar
    if (!fs.existsSync(imagePath)) {
      return m.reply("❌ La imagen del menú de descargas no se encontró. Verifica la ruta y el nombre del archivo.");
    }

    await client.sendMessage(m.chat, {
      image: fs.readFileSync(imagePath),
      caption: text,
      footer: "YerTX Bot",
      buttons: buttons,
      headerType: 4
    });
  }
};
