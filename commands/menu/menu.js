module.exports = {
  command: ["menu", "help", "ayuda"],

  run: async (client, m, { prefix }) => {

    // 🌐 Array de imágenes y GIFs (URL)
    const mediaList = [
      "https://i.ibb.co/vxnNFXpY/menua3.webp", // imagen
      "https://i.ibb.co/hFDcdpBg/menu.png",     // imagen
      "https://files.catbox.moe/wv34z5.mp4",    // gif animado
      "https://files.catbox.moe/5l90ml.mp4"     // gif animado 2
    ];

    // 🎲 Elegir aleatoriamente uno de los medios
    const randomMedia = mediaList[Math.floor(Math.random() * mediaList.length)];

    // 📜 Texto del menú con diseño moderno y caracteres especiales
    const caption = `
╔═══════════════════════╗
║ ✦  𝗞𝗜𝗟𝗟𝗨𝗔 𝗕𝗢𝗧 𝗗𝗩 𝗩1.00 ✦ ║
╠═══════════════════════╣
👤 Usuario: *${m.pushName}*
🏴 Estado: Activo
🕶️ Versión: v1.00

✨ ¡Gracias por usar *Killua Bot DV*! ✨
Si te gusta el bot, visita mi GitHub, sigue y dale ⭐ a tus proyectos favoritos.

🔗 [Visita mi GitHub](https://github.com/DevYerZx/killua-bot-dev.git)

━━━━━━━━━━━━━━━━━━
👑 *CREADOR: DVYER*
`;

    // 🔘 Botones del menú
    const buttons = [
      { buttonId: ".menu_descargas", buttonText: { displayText: "📥 Descargas" }, type: 1 },
      { buttonId: ".menu_utilidades", buttonText: { displayText: "🛠 Utilidades" }, type: 1 },
      { buttonId: ".menu_infobot", buttonText: { displayText: "🤖 InfoBot" }, type: 1 },
      { buttonId: ".peliculas_series", buttonText: { displayText: "🎬 Películas/Series" }, type: 1 }
    ];

    // 🔄 Enviar mensaje según tipo de media (imagen o GIF)
    if (randomMedia.endsWith(".mp4")) {
      await client.sendMessage(
        m.chat,
        {
          video: { url: randomMedia },
          caption: caption,
          buttons: buttons,
          footer: "✨ YerTX Bot • DVYER ✨",
          headerType: 4,
          gifPlayback: true // 🔥 hace que se reproduzca automáticamente como GIF
        },
        { quoted: m, ...global.channelInfo }
      );
    } else {
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

