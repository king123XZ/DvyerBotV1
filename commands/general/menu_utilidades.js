module.exports = {
  command: ["menu_utilidades"],
  description: "Muestra el menú de utilidades",
  run: async (client, m) => {

    const text = `
⧼ KILLUA-BOT V1.00 - 𝗨𝗧𝗜𝗟𝗜𝗗𝗔𝗗𝗘𝗦 ⧽
──────────────────────────────

🛠 Comandos disponibles:

• sticker → Crear sticker
• speed → mide velocidad de internet del bot 
• antilink on o off → borra enlaces de grupos o canales de whsap

──────────────────────────────
🔹 Usa los botones para navegar:
`;

    const buttons = [
      { buttonId: ".menu_descargas", buttonText: { displayText: "📥 Descargas" }, type: 1 },
      { buttonId: ".menu_infobot", buttonText: { displayText: "🤖 InfoBot" }, type: 1 },
      { buttonId: ".menu", buttonText: { displayText: "🏠 Menú Principal" }, type: 1 },
      { buttonId: ".canal", buttonText: { displayText: "📢 Canal" }, type: 1 } // Nuevo botón
    ];

    await client.sendMessage(m.chat, {
      image: { url: "https://i.ibb.co/Hc4WW2s/b937a90c8a578fc77451f47fa43650b1.jpg" },
      caption: text,
      footer: "YerTX Bot",
      buttons: buttons,
      headerType: 4
    });
  }
};

