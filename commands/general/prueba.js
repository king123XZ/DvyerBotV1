const fs = require("fs");
const path = require("path");

module.exports = {
  command: ["menu1"],
  description: "Muestra el menú principal",
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

    // 📷 Ruta de la imagen local del menú
    const imagePath = path.join(__dirname, "..", "..", "imagenesDvYer", "menu.png");

    if (!fs.existsSync(imagePath)) {
      return m.reply("❌ La imagen del menú no se encontró. Verifica la ruta y el nombre del archivo.");
    }

    // 🔹 Enviar menú principal con 3 botones
    await client.sendMessage(m.chat, {
      image: fs.readFileSync(imagePath),
      caption: `⧼ KILLUA DV V1.00 ⧽

👤 Usuario: ${m.pushName}
🏴 Modo: Activo
🕶️ Versión: v2.0

━━━━━━━━━━━━━━━━━━
👑 *CREADOR: DVYER*`,
      buttons: [
        { buttonId: ".menu_descargas", buttonText: { displayText: "📥 Descargas" }, type: 1 },
        { buttonId: ".menu_utilidades", buttonText: { displayText: "🛠 Utilidades" }, type: 1 },
        { buttonId: ".menu_infobot", buttonText: { displayText: "🤖 InfoBot" }, type: 1 }
      ],
      footer: "YerTX Bot • DVYER",
      headerType: 4
    });

    // ⬇️ Enviar mensaje separado con botón que abre el canal de WhatsApp
    await client.sendMessage(m.chat, {
      image: { url: "https://i.ibb.co/hFDcdpBg/menu.png" }, // Imagen del canal
      caption: "📢 ¡Únete a mi canal de WhatsApp para todas las novedades!",
      footer: "YerTX Bot • DVYER",
      buttons: [
        {
          urlButton: {
            displayText: "Ir al Canal",
            url: "https://whatsapp.com/channel/0029VaH4xpUBPzjendcoBI2c"
          }
        }
      ],
      headerType: 4
    });
  }
};
