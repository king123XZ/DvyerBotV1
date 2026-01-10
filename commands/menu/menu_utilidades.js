module.exports = {
  command: ["menu_utilidades"],
   categoria: "menu",
  description: "Muestra el menú de utilidades",
  run: async (client, m) => {

    const text = `
╔═══════════════════════╗
║ ⌬  𝗞𝗜𝗟𝗟𝗨𝗔-𝗕𝗢𝗧 𝗩1.00 ⌬ ║
║      ✦ UTILIDADES / GRUPOS ✦
╚═══════════════════════╝

🛠  𝗖𝗼𝗺𝗮𝗻𝗱𝗼𝘀 𝗱𝗶𝘀𝗽𝗼𝗻𝗶𝗯𝗹𝗲𝘀:
💥 kick → Elimina a un miembro del grupo
🎨 sticker → Crear sticker con imagen o video
⚡ speed → Mide velocidad de internet del bot
🚫 antilink on/off → Borra enlaces de grupos/canales

──────────────────────────────
✨ Usa los botones para navegar y explorar más ✨
💡 ¡Puedes usar stickers para interactuar!
`;

    const buttons = [
      { buttonId: ".menu_descargas", buttonText: { displayText: "📥 Descargas" }, type: 1 },
      { buttonId: ".menu_infobot", buttonText: { displayText: "🤖 InfoBot" }, type: 1 },
      { buttonId: ".menu", buttonText: { displayText: "🏠 Menú Principal" }, type: 1 },
      { buttonId: ".canal", buttonText: { displayText: "📢 Canal" }, type: 1 }
    ];

    await client.sendMessage(m.chat, {
      image: { url: "https://i.ibb.co/W4VQ7bwX/menu-ultidades-Grupos.webp" },
      caption: text,
      footer: "✨ YerTX Bot ✨",
      buttons: buttons,
      headerType: 4
    });
  }
};

