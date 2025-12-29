const fs = require("fs");
const path = require("path");

module.exports = {
  command: ["m1"],

  run: async (client, m, { prefix }) => {
    // Validación de owner/admin
    const owners = ["51917391317@s.whatsapp.net", "51907376960@s.whatsapp.net"];
    const isOwner = owners.includes(m.sender);
    const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat) : {};
    const admins = m.isGroup ? groupMetadata.participants.filter(p => p.admin) : [];
    const isAdmin = admins.some(p => p.id === m.sender);
    if (!isOwner && !isAdmin) return m.reply("🚫 Solo OWNER o ADMINS pueden usar este comando.");

    // Ruta del menú
    const imagePath = path.join(__dirname, "..", "..", "imagenesDvYer", "menu.png");
    if (!fs.existsSync(imagePath)) return m.reply("❌ Imagen del menú no encontrada.");

    // 1️⃣ Enviar menú con 3 botones normales
    await client.sendMessage(m.chat, {
      image: fs.readFileSync(imagePath),
      caption: `⧼KILLUA DV V1.00⧽

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

    // 2️⃣ Enviar botón usando el ID del canal
    const canalID = "120363401477412280@newsletter"; // ID de tu canal
    await client.sendMessage(m.chat, {
      text: "📢 ¡Únete al canal oficial del bot!",
      contextInfo: {
        forwardedNewsletterMessageInfo: {
          newsletterJid: canalID,
          newsletterName: "Canal Oficial DVYER"
        }
      },
      footer: "YerTX Bot • DVYER",
      headerType: 1
    });
  }
};
