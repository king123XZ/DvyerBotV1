module.exports = {
  command: ["canal", "mi_canal"],
  description: "Envía el enlace de tu canal de WhatsApp con imagen",
  run: async (client, m) => {
    try {
      const canalText = `
📢 *Únete a nuestro canal de WhatsApp*  

Mantente actualizado con noticias, descargas y novedades del bot.  
Haz clic en el enlace y únete ahora 👇
`;

      await client.sendMessage(m.chat, {
        image: { url: "https://i.ibb.co/hFDcdpBg/menu.png" },
        caption: canalText + "\nhttps://whatsapp.com/channel/0029VaH4xpUBPzjendcoBI2c",
        footer: "YerTX Bot • DVYER",
        headerType: 4
      });

    } catch (error) {
      console.error("Error enviando enlace del canal:", error);
      m.reply("❌ Ocurrió un error al enviar el enlace del canal.");
    }
  }
};
