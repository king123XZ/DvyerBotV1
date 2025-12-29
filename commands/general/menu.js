const fs = require("fs");
const path = require("path");

module.exports = {
  command: ["menu", "help", "ayuda"],

  run: async (client, m, { prefix }) => {
    const owners = [
      "51917391317@s.whatsapp.net",
      "51907376960@s.whatsapp.net"
    ];

    const isOwner = owners.includes(m.sender);

    const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat) : {};
    const admins = m.isGroup
      ? groupMetadata.participants.filter(p => p.admin)
      : [];

    const isAdmin = admins.some(p => p.id === m.sender);

    if (!isOwner && !isAdmin) {
      return m.reply("🚫 *Este comando solo puede usarlo el OWNER o los ADMINS del grupo.*");
    }

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
        }
      ],
      footer: "YerTX Bot • DVYER",
      headerType: 4
    });
  }
};
