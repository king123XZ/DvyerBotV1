module.exports = {
  command: ["menu_utilidades"],
  description: "Muestra el menú de utilidades",
  run: async (client, m) => {

    const text = `
⧼ 𝐘𝐞𝐫𝐓𝐗 𝐁𝐎𝐓 - 𝗨𝗧𝗜𝗟𝗜𝗗𝗔𝗗𝗘𝗦 ⧽
──────────────────────────────

🛠 Comandos disponibles:

• sticker → Crear sticker
• toimg → Convertir sticker a imagen
• hd → Descargar imagen HD
• qr → Generar código QR

──────────────────────────────
🔹 Usa los botones para navegar:
`;

    const buttons = [
      { buttonId: ".menu_descargas", buttonText: { displayText: "📥 Descargas" }, type: 1 },
      { buttonId: ".menu_infobot", buttonText: { displayText: "🤖 InfoBot" }, type: 1 },
      { buttonId: ".menu", buttonText: { displayText: "🏠 Menú Principal" }, type: 1 }
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

