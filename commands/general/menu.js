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
🏴 Estado: Activo
🕶️ Versión: v1.00

✨ ¡Gracias por usar Killua Bot DV! ✨
Si te gusta el bot, puedes visitar mi GitHub, seguirme y darle ⭐ a tu proyecto favorito.
Cada estrella ayuda a mejorar y mantener el bot actualizado.  

🔗 [Visita mi GitHub](https://github.com/DevYerZx/killua-bot-dev.git)

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
          buttonText: { displayText: "🛠 Utilidades/grupos" },
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
        },
        {
          buttonId: ".series", // Nuevo botón para series
          buttonText: { displayText: "📺 SERIES" },
          type: 1
        }
      ],
      footer: "YerTX Bot • DVYER",
      headerType: 4
    });
  }
};
