const fs = require("fs");
const path = require("path");

module.exports = {
  command: ["menu", "help", "ayuda"],

  run: async (client, m, { prefix }) => {

    // 📷 Ruta corregida del menú
    const imagePath = path.join(__dirname, "..", "..", "imagenesDvYer", "menu.png"); // ajusta extensión si es jpg

    // Comprobar si el archivo existe antes de enviar
    if (!fs.existsSync(imagePath)) {
      return m.reply("❌ La imagen del menú no se encontró. Verifica la ruta y el nombre del archivo.");
    }

    // 📸 Enviar imagen con botones
    await client.sendMessage(m.chat, {
      image: fs.readFileSync(imagePath),
      caption: `⧼KILLUA DV V1.00⧽

👤 Usuario: ${m.pushName}
🏴 Modo: Activo
🕶️ Versión: v2.0

━━━━━━━━━━━━━━━━━━
👑 *CREADOR: DVYER*`,
      buttons: [
        {
          buttonId: ".menu_descargas",
          buttonText: { displayText: "📥 Descargas" },
          type: 1
        },
        {
          buttonId: ".menu_utilidades",
          buttonText: { displayText: "🛠 Utilidades" },
          type: 1
        },
        {
          buttonId: ".menu_infobot",
          buttonText: { displayText: "🤖 InfoBot" },
          type: 1
        },
        {
          buttonId: ".peliculas",
          buttonText: { displayText: "PELICULAS" },
          type: 1
        }
      ],
      footer: "YerTX Bot • DVYER",
      headerType: 4
    });
  }
};


