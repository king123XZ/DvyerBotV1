// commands/general/menu.js
module.exports = {
  name: "menu",
  alias: ["help", "ayuda"],
  run: async (client, m) => {

    // 1️⃣ Enviar la imagen del menú
    await client.sendMessage(m.chat, {
      image: { url: "https://i.ibb.co/XxdTkYNq/menu.png" },
      caption: `⧼ 𝐘𝐞𝐫𝐓𝐗 𝐁𝐎𝐓 - 𝐌𝐄𝐍𝐔 𝐇𝐀𝐂𝐊𝐄𝐑 ⧽

👤 Usuario: ${m.pushName}
🏴 Modo: Hacker Oscuro
🕶️ Versión: 2.0`
    });

    // 2️⃣ Enviar botones por secciones
    const buttons = [
      { buttonId: "menu_descargas", buttonText: { displayText: "📥 Descargas" }, type: 1 },
      { buttonId: "menu_utilidades", buttonText: { displayText: "🛠 Utilidades" }, type: 1 },
      { buttonId: "menu_infobot", buttonText: { displayText: "🤖 InfoBot" }, type: 1 },
    ];

    await client.sendMessage(m.chat, {
      text: "Selecciona una categoría:",
      footer: "YerTX Bot",
      buttons: buttons,
      headerType: 1
    });
  }
};
