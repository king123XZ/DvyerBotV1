module.exports = {
  command: ["menu_descargas"],
  description: "Muestra el menú de descargas",
  run: async (client, m) => {

    const text = `
⧼ 𝐘𝐞𝐫𝐓𝐗 𝐁𝐎𝐓 - 𝗗𝗘𝗦𝗖𝗔𝗥𝗚𝗔𝗦 ⧽
──────────────────────────────

📥 Comandos disponibles:

• ytmp3 → Descargar música de YouTube
• ytmp4 → Descargar video de YouTube
• play → Reproducir y descargar música
• tiktok → Descargar video de TikTok
• facebook → Descargar video de Facebook

──────────────────────────────
🔹 Navega usando los botones:
`;

    const buttons = [
      { buttonId: "menu_utilidades", buttonText: { displayText: "🛠 Utilidades" }, type: 1 },
      { buttonId: "menu_infobot", buttonText: { displayText: "🤖 InfoBot" }, type: 1 },
      { buttonId: "menu", buttonText: { displayText: "🏠 Menú Principal" }, type: 1 }
    ];

    await client.sendMessage(m.chat, {
      text,
      footer: "YerTX Bot",
      buttons,
      headerType: 1
    });
  }
};
