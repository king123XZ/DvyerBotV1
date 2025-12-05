module.exports = {
  name: "menu",
  alias: ["help", "ayuda"],
  run: async (client, m) => {

    // Primero mandamos la imagen del menú (funciona en privado y grupos)
    await client.sendMessage(m.chat, {
      image: { url: "https://i.ibb.co/XxdTkYNq/menu.png" },
      caption: `⧼ 𝐘𝐞𝐫𝐓𝐗 𝐁𝐎𝐓 - 𝐌𝐄𝐍𝐔 𝐇𝐀𝐂𝐊𝐄𝐑 ⧽

👤 Usuario: ${m.pushName}
🏴 Modo: Hacker Oscuro
🕶️ Versión: 2.0`
    });

    // Ahora enviamos el menú con los botones (funciona en PV y grupo)
    await client.sendMessage(m.chat, {
      text: "Selecciona una categoría:",
      footer: "YerTX Bot - Sistema Hacker",
      templateButtons: [
        { 
          index: 1, 
          quickReplyButton: { 
            displayText: "📥 Descargas", 
            id: "descargas_menu" 
          } 
        },
        { 
          index: 2, 
          quickReplyButton: { 
            displayText: "🛠 Utilidades", 
            id: "utilidades_menu" 
          } 
        },
        { 
          index: 3, 
          quickReplyButton: { 
            displayText: "🤖 InfoBot", 
            id: "infobot_menu" 
          } 
        }
      ]
    });
  }
};
