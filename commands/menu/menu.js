module.exports = {
  command: ["menu", "help", "ayuda"],

  run: async (client, m, { prefix }) => {

    // 🌐 Array de imágenes y GIFs (URL)
    const mediaList = [
      "https://i.ibb.co/vxnNFXpY/menua3.webp", // imagen 1
      "https://i.ibb.co/hFDcdpBg/menu.png", // imagen 2 (puedes agregar más)
      "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif", // gif animado
      "https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif"  // gif animado 2
    ];

    // 🎲 Elegir aleatoriamente uno de los medios
    const randomMedia = mediaList[Math.floor(Math.random() * mediaList.length)];

    // 📜 Texto del menú
    const caption = `
⧼KILLUA DV V1.00⧽

👤 Usuario: ${m.pushName}
🏴 Estado: Activo
🕶️ Versión: v1.00

✨ ¡Gracias por usar Killua Bot DV! ✨
Si te gusta el bot, visita mi GitHub, sigue y dale ⭐ a tu proyecto favorito.

🔗 [Visita mi GitHub](https://github.com/DevYerZx/killua-bot-dev.git)

━━━━━━━━━━━━━━━━━━
👑 *CREADOR: DVYER*
`;

    // 🔘 Botones del menú
    const buttons = [
      { buttonId: ".menu_descargas", buttonText: { displayText: "📥 Descargas" }, type: 1 },
      { buttonId: ".menu_utilidades", buttonText: { displayText: "🛠 Utilidades/grupos" }, type: 1 },
      { buttonId: ".menu_infobot", buttonText: { displayText: "🤖 InfoBot" }, type: 1 },
      { buttonId: ".peliculas_series", buttonText: { displayText: "PELICULAS/SERIES" }, type: 1 }
    ];

    // 🔄 Enviar mensaje según tipo de media (jpg/png o gif/video)
    if (randomMedia.endsWith(".gif") || randomMedia.endsWith(".mp4")) {
      // enviar como video/GIF
      await client.sendMessage(
        m.chat,
        {
          video: { url: randomMedia },
          caption: caption,
          buttons: buttons,
          footer: "YerTX Bot • DVYER",
          headerType: 4
        },
        { quoted: m, ...global.channelInfo }
      );
    } else {
      // enviar como imagen
      await client.sendMessage(
        m.chat,
        {
          image: { url: randomMedia },
          caption: caption,
          buttons: buttons,
          footer: "YerTX Bot • DVYER",
          headerType: 4
        },
        { quoted: m, ...global.channelInfo }
      );
    }
  }
};
