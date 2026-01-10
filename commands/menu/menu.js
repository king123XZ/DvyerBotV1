module.exports = {
  command: ["menu", "help", "ayuda"],

  run: async (client, m, { prefix }) => {

    // 🌐 Array de imágenes y "GIFs" (MP4 convertidos a WebP/GIF)
    const mediaList = [
      "https://i.ibb.co/vxnNFXpY/menua3.webp", // imagen normal
      "https://i.ibb.co/hFDcdpBg/menu.png"   // imagen normal
      //"https://files.catbox.moe/wv34z5.gif",    // GIF animado
      //"https://files.catbox.moe/5l90ml.gif"     // GIF animado
    ];

    // 🎲 Elegir aleatoriamente uno
    const randomMedia = mediaList[Math.floor(Math.random() * mediaList.length)];

    const caption = `
╔═══════════════════════╗
║ ✦  𝗞𝗜𝗟𝗟𝗨𝗔 𝗕𝗢𝗧 𝗗𝗩 𝗩1.00 ✦ ║
╠═══════════════════════╣
👤 Usuario: *${m.pushName}*
🏴 Estado: Activo
🕶️ Versión: v1.00

✨ ¡Gracias por usar *Killua Bot DV*! ✨
Si te gusta el bot, visita mi GitHub y dale ⭐.

🔗 [GitHub](https://github.com/DevYerZx/killua-bot-dev.git)

━━━━━━━━━━━━━━━━━━
👑 *CREADOR: DVYER*
`;

    const buttons = [
      { buttonId: ".menu_descargas", buttonText: { displayText: "📥 Descargas" }, type: 1 },
      { buttonId: ".menu_utilidades", buttonText: { displayText: "🛠 Utilidades/grupos" }, type: 1 },
      { buttonId: ".menu_infobot", buttonText: { displayText: "🤖 InfoBot" }, type: 1 },
      { buttonId: ".peliculas_series", buttonText: { displayText: "🎬 Películas/Series" }, type: 1 }
    ];

    // 🔄 Enviar como imagen/GIF animado para que se reproduzca solo
    if (randomMedia.endsWith(".gif") || randomMedia.endsWith(".webp")) {
      await client.sendMessage(
        m.chat,
        {
          image: { url: randomMedia }, // ⚡ GIF animado o WebP
          caption: caption,
          buttons: buttons,
          footer: "✨ YerTX Bot • DVYER ✨",
          headerType: 4
        },
        { quoted: m, ...global.channelInfo }
      );
    } else {
      // enviar como imagen normal
      await client.sendMessage(
        m.chat,
        {
          image: { url: randomMedia },
          caption: caption,
          buttons: buttons,
          footer: "✨ YerTX Bot • DVYER ✨",
          headerType: 4
        },
        { quoted: m, ...global.channelInfo }
      );
    }
  }
};
