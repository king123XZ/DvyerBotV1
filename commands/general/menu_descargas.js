module.exports = {
  command: ["menu_descargas"],
  description: "Muestra el menú de descargas",
  run: async (client, m) => {

    const text = `
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

──────────────────────────────
🔹 *Navega usando los botones:*
`;

    // 3 botones normales del menú
    const buttons = [
      { buttonId: ".menu_utilidades", buttonText: { displayText: "🛠 Utilidades" }, type: 1 },
      { buttonId: ".menu_infobot", buttonText: { displayText: "🤖 InfoBot" }, type: 1 },
      { buttonId: ".menu", buttonText: { displayText: "🏠 Menú Principal" }, type: 1 }
    ];

    try {
      // 1️⃣ Enviar imagen del menú con los 3 botones normales
      await client.sendMessage(m.chat, {
        image: { url: "https://i.ibb.co/NnW9LWdL/menu-descarga.png" },
        caption: text,
        footer: "YerTX Bot • DVYER",
        buttons: buttons,
        headerType: 4
      });

      // 2️⃣ Enviar un segundo mensaje con botón URL del canal
      const channelButton = [
        {
          urlButton: {
            displayText: "📢 Canal de Bot",
            url: "https://whatsapp.com/channel/0029VaH4xpUBPzjendcoBI2c"
          }
        }
      ];

      await client.sendMessage(m.chat, {
        image: { url: "https://i.ibb.co/NnW9LWdL/menu-descarga.png" }, // Puedes usar la misma imagen o una del canal
        caption: "Únete a nuestro canal de WhatsApp",
        footer: "YerTX Bot • DVYER",
        buttons: channelButton,
        headerType: 4
      });

    } catch (error) {
      console.error("Error enviando menú de descargas:", error);
      m.reply("❌ Ocurrió un error al enviar el menú de descargas.");
    }
  }
};

