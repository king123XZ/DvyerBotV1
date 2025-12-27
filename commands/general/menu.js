module.exports = {
  command: ["menu", "help", "ayuda"],

  run: async (client, m, { prefix }) => {
    const owners = [
      "51917391317@s.whatsapp.net",
      "51907376960@s.whatsapp.net"
    ];

    const isOwner = owners.includes(m.sender);

    const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat) : {};
    const admins = m.isGroup ? groupMetadata.participants.filter(p => p.admin) : [];
    const isAdmin = admins.some(p => p.id === m.sender);

    if (!isOwner && !isAdmin) {
      return m.reply("🚫 *Este comando solo puede usarlo el OWNER o los ADMINS del grupo.*");
    }


    await client.sendMessage(m.chat, {
      image: { url: "https://i.ibb.co/XxdTkYNq/menu.png" },
      caption: `⧼ 𝐘𝐞𝐫𝐓𝐗 𝐁𝐎𝐓 - CREADOR DVYER ⧽

👤 Usuario: ${m.pushName}
🏴 Modo: activo 
🕶️ Versión: v 2.0`
    });

    const buttons = [
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
    ];

    await client.sendMessage(m.chat, {
      text: "Selecciona una categoría:",
      footer: "YerTX Bot",
      buttons: buttons,
      headerType: 1
    });
  }
};
