import fs from "fs";
import path from "path";
import moment from "moment-timezone";

const cooldowns = new Map();
const COOLDOWN_DURATION = 180000; // 3 minutos

module.exports = {
  command: ["menu1"],
  description: "Muestra el menú principal",
  run: async (client, m, { prefix }) => {

    const chatId = m.key.remoteJid;
    const now = Date.now();
    const chatData = cooldowns.get(chatId) || { lastUsed: 0, menuMessage: null };
    const timeLeft = COOLDOWN_DURATION - (now - chatData.lastUsed);

    if (timeLeft > 0) {
      const senderTag = m.sender ? `@${m.sender.split('@')[0]}` : '@usuario';
      await client.reply(chatId, `⚠️ Hey ${senderTag}, solo se puede enviar el menú cada 3 minutos. Desplázate hacia arriba para verlo.`, chatData.menuMessage || m);
      return;
    }

    // Datos del usuario y bot
    const name = m.pushName || 'Usuario';
    const fecha = moment.tz('America/Argentina/Buenos_Aires').format('DD/MM/YYYY');
    const hora = moment.tz('America/Argentina/Buenos_Aires').format('HH:mm:ss');
    const botName = client.user?.name || 'YerTX Bot';

    // Texto del menú
    const text = `⧼ ${botName} V1.00 ⧽

Hola 👋🏻 *${name}*

📅 Fecha: ${fecha}
⏰ Hora: ${hora}

━━━━━━━━━━━━━━━━━━
👑 *CREADOR: DVYER*

🔹 Navega usando los botones:`;

    // Botones normales (máximo 3)
    const buttons = [
      { buttonId: ".menu_descargas", buttonText: { displayText: "📥 Descargas" }, type: 1 },
      { buttonId: ".menu_utilidades", buttonText: { displayText: "🛠 Utilidades" }, type: 1 },
      { buttonId: ".menu_infobot", buttonText: { displayText: "🤖 InfoBot" }, type: 1 }
    ];

    // Ruta de la imagen local
    const imagePath = path.join(__dirname, "..", "..", "imagenesDvYer", "menu.png");

    if (!fs.existsSync(imagePath)) {
      return m.reply("❌ La imagen del menú no se encontró. Verifica la ruta y el nombre del archivo.");
    }

    // Enviar menú con imagen y botones normales
    const menuMessage = await client.sendMessage(chatId, {
      image: fs.readFileSync(imagePath),
      caption: text,
      footer: botName + " • DVYER",
      buttons: buttons,
      headerType: 4
    });

    // Guardar cooldown
    cooldowns.set(chatId, { lastUsed: now, menuMessage });

    // Enviar un segundo mensaje como “reenviado desde el canal”
    try {
      await client.sendMessage(chatId, {
        text: "📢 Únete a nuestro canal de WhatsApp para novedades y actualizaciones:",
        contextInfo: {
          forwardedNewsletterMessageInfo: {
            newsletterJid: ["120363401477412280@newsletter"], // tu canal
            newsletterName: "YerTX Bot 📌"
          },
          forwardingScore: 999,
          isForwarded: true
        }
      });
    } catch (err) {
      console.error("Error enviando mensaje del canal:", err);
    }
  }
};

