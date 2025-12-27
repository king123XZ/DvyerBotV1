module.exports = {
  command: ["menu_descargas"],
  description: "Muestra el menú de descargas",
  run: async (client, m) => {

    const text = `
⧼ 𝐘𝐞𝐫𝐓𝐗 𝐁𝐎𝐓 - 𝗗𝗘𝗦𝗖𝗔𝗥𝗚𝗔𝗦 ⧽
creador dev yer
──────────────────────────────

📥 Comandos disponibles:

• ytaudio → Descargar música de YouTube url
• ytvideo → Descargar video de YouTube url
• ytdoc → Descargar video documento de YouTube url
• play → Descargar música y videos (recomendado)
• tiktok → Descargar video de TikTok
• facebook → Descargar video de Facebook
• mediafire - mf  URL → Descargar archivo de mediafire

──────────────────────────────
🔹 Navega usando los botones:
`;

    const buttons = [
      { buttonId: ".menu_utilidades", buttonText: { displayText: "🛠 Utilidades" }, type: 1 },
      { buttonId: ".menu_infobot", buttonText: { displayText: "🤖 InfoBot" }, type: 1 },
      { buttonId: ".menu", buttonText: { displayText: "🏠 Menú Principal" }, type: 1 }
    ];

    await client.sendMessage(m.chat, {
      image: { url: "https://i.ibb.co/1Ytc8hcq/4715021777a54cfb94cd3bac0d53ead4.jpg" },
      caption: text,
      footer: "YerTX Bot",
      buttons: buttons,
      headerType: 4
    });
  }
};

