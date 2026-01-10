module.exports = {
  command: ["menu_infobot"],
   categoria: "menu",
  description: "Muestra la información del bot",
  run: async (client, m) => {

    const text = `
⧼ KILLUA BOT V1.00 - 𝗜𝗡𝗙𝗢𝗕𝗢𝗧 ⧽
──────────────────────────────

🤖 Información del bot:
• info → informacion sobre el sistema del bot 
• ping → Latencia del bot
• owner → Info del creador
──────────────────────────────
🔹 Usa los botones para moverte entre secciones.
`;

    const buttons = [
      { buttonId: ".menu_descargas", buttonText: { displayText: "📥 Descargas" }, type: 1 },
      { buttonId: ".menu_utilidades", buttonText: { displayText: "🛠 Utilidades" }, type: 1 },
      { buttonId: ".menu", buttonText: { displayText: "🏠 Menú Principal" }, type: 1 },
      { buttonId: ".canal", buttonText: { displayText: "📢 Canal" }, type: 1 } // Nuevo botón
    ];

    await client.sendMessage(m.chat, {
      image: { url: "https://i.ibb.co/fdFtWCkC/info-bot.png" },
      caption: text,
      footer: "YerTX Bot",
      buttons: buttons,
      headerType: 4
    });
  }
};


