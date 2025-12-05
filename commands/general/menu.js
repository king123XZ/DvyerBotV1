const fs = require("fs");
const path = require("path");

module.exports = {
  command: ["menu", "help", "ayuda"],
  category: "general",
  description: "Muestra el menú del bot",

  run: async (client, m) => {
    try {
      // Buscar imagen válida
      const mediaFolder = "./media";
      const imageFiles = ["menu.jpg", "menu.png"];

      let menuImage = null;

      for (const file of imageFiles) {
        const filePath = path.join(mediaFolder, file);
        if (fs.existsSync(filePath)) {
          menuImage = filePath;
          break;
        }
      }

      const menuText = `
╔═━「 *📀 MENÚ DEL BOT* 」
┃
┃  ✦  .menu
┃  ✦  .ytdoc
┃  ✦  .play
┃  ✦  .info
┃  ✦  .owner
┃
╚═━「 *Mini Lurus — 2025* 」
`;

      if (!menuImage) {
        // Si no hay imagen, enviar solo texto
        return client.sendMessage(
          m.chat,
          { text: menuText },
          { quoted: m }
        );
      }

      // Si hay imagen JPG o PNG → se envía
      const imgBuffer = fs.readFileSync(menuImage);

      await client.sendMessage(
        m.chat,
        {
          image: imgBuffer,
          caption: menuText
        },
        { quoted: m }
      );

    } catch (err) {
      console.log("❌ Error en menú:", err);
      return client.sendMessage(
        m.chat,
        { text: "❌ Error cargando el menú." },
        { quoted: m }
      );
    }
  }
};


