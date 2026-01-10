const fs = require("fs");
const path = require("path");

module.exports = {
  command: ["menu_descargas"],
   categoria: "menu",
  description: "Muestra el menú de descargas",
  run: async (client, m) => {

    const menuText = `
⧼ killua-bot V1.00 - 𝗗𝗘𝗦𝗖𝗔𝗥𝗚𝗔𝗦 ⧽
📌 Creador: Dev Yer
──────────────────────────────

📥 *Comandos disponibles:*

🎵 ytaudio → Descargar música de YouTube (url)
🎬 ytvideo → Descargar video de YouTube (url)
📄 ytdoc → Descargar video documento de YouTube (url)
🎶 spotify → Buscar canción por nombre
🎧 play → Descargar música y videos (recomendado)
📹 tiktok → Descargar video de TikTok
📺 facebook → Descargar video de Facebook
💾 mediafire - mf URL → Descargar archivo de Mediafire
📄 apk → Escribe nombre de la app que quieras descargar
🎬instagram → Descargar video /imagen enviar url
──────────────────────────────
🔹 *Navega usando los botones:*
`;

    const buttons = [
      { buttonId: ".menu_utilidades", buttonText: { displayText: "🛠 Utilidades" }, type: 1 },
      { buttonId: ".menu_infobot", buttonText: { displayText: "🤖 InfoBot" }, type: 1 },
      { buttonId: ".menu", buttonText: { displayText: "🏠 Menú Principal" }, type: 1 },
      { buttonId: ".canal", buttonText: { displayText: "📢 Canal" }, type: 1 } // botón para ejecutar comando canal
    ];

    try {
     
      await client.sendMessage(m.chat, {
        image: { url: "https://i.ibb.co/NnW9LWdL/menu-descarga.png" },
        caption: menuText,
        footer: "YerTX Bot • DVYER",
        buttons: buttons,
        headerType: 4
      });

    } catch (error) {
      console.error("Error enviando menú de descargas:", error);
      m.reply("❌ Ocurrió un error al enviar el menú de descargas.");
    }
  }
};
