module.exports = {
  command: ["menu_infobot"],
  description: "Muestra la información del bot",
  run: async (client, m) => {

    const text = `
⧼ 𝐘𝐞𝐫𝐓𝐗 𝐁𝐎𝐓 - 𝗜𝗡𝗙𝗢𝗕𝗢𝗧 ⧽
──────────────────────────────

🤖 Información del bot:

• ping → Latencia del bot
• owner → Info del creador
──────────────────────────────
🔹 Usa los botones para moverte entre secciones.
`;

    const buttons = [
      { buttonId: ".menu_descargas", buttonText: { displayText: "📥 Descargas" }, type: 1 },
      { buttonId: ".menu_utilidades", buttonText: { displayText: "🛠 Utilidades" }, type: 1 },
      { buttonId: ".menu", buttonText: { displayText: "🏠 Menú Principal" }, type: 1 }
    ];

    await client.sendMessage(m.chat, {
      image: { url: "https://i.ibb.co/4wMLkyFY/0d3aa4316a1fde7af118219f33cd08e3.jpg" },
      caption: text,
      footer: "YerTX Bot",
      buttons: buttons,
      headerType: 4
    });
  }
};

