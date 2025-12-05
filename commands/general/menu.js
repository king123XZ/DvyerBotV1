module.exports = {
  command: ["menu", "help", "ayuda"],
  category: "general",
  description: "Muestra el menú del bot en modo hacker oscuro",

  run: async (client, m) => {

    const menu = `
⫷✦ 𝐘𝐞𝐫𝐓𝐗 𝐁𝐎𝐓 - 𝐌𝐄𝐍𝐔 𝐇𝐀𝐂𝐊𝐄𝐑 ✦⫸
┏━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🧬 Usuario: ${m.pushName}
┃ 🛰️ Modo: Hacker Oscuro
┃ ⚙️ Versión: 2.5 PRO
┗━━━━━━━━━━━━━━━━━━━━━━┛

『 ⚡ DESCARGAS ⚡ 』
» ytmp3        ⟢ Descargar MP3
» ytmp4        ⟢ Descargar MP4
» play         ⟢ Reproducir música
» tiktok       ⟢ Videos TikTok
» facebook     ⟢ Videos Facebook

『 🛠️ UTILIDADES 🛠️ 』
» sticker      ⟢ Crear sticker
» toimg        ⟢ Sticker a imagen
» hd           ⟢ Mejora tu foto
» qr           ⟢ Generar QR

『 📡 INFO BOT 📡 』
» ping         ⟢ Latencia
» owner        ⟢ Creador
» runtime      ⟢ Tiempo activo
» estado       ⟢ Estado del bot

━━━━━━━━━━━━━━━━━━━━━━
⚠️ Uso exclusivo para fines legales.
`;

    await client.sendMessage(m.chat, {
      image: { url: "https://i.ibb.co/XxdTkYNq/menu.png" },
      caption: menu
    });
  }
};


