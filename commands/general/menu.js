module.exports = {
  command: ["menu", "help", "ayuda"],

  run: async (client, m, { prefix }) => {

    // Enviar la imagen del menú principal
    await client.sendMessage(m.chat, {
      image: { url: "https://i.ibb.co/XxdTkYNq/menu.png" },
      caption: `⧼ 𝐘𝐞𝐫𝐓𝐗 𝐁𝐎𝐓 - 𝐌𝐄𝐍𝐔 𝐇𝐀𝐂𝐊𝐄𝐑 ⧽

👤 Usuario: ${m.pushName}
🏴 Modo: Hacker Oscuro
🕶️ Versión: 2.0`
    });

    // Botones de categorías
    const buttons = [
      {
        buttonId: ".menu_descargas",
        buttonText: { displayText: "📥 Descargas" },
        type: 1
      },
      {
        buttonId: "menu_utilidades",
        buttonText: { displayText: "🛠 Utilidades" },
        type: 1
      },
      {
        buttonId: "menu_infobot",
        buttonText: { displayText: "🤖 InfoBot" },
        type: 1
      }
    ];

    // Enviar los botones
    await client.sendMessage(m.chat, {
      text: "Selecciona una categoría:",
      footer: "YerTX Bot",
      buttons: buttons,
      headerType: 1
    });
  }
};
