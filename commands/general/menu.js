const fs = require("fs"); // ← ESTO FALTABA Y GENERABA EL ERROR

module.exports = {
  command: ["menu", "help", "ayuda"],
  description: "Muestra el menú del bot",
  category: "general",

  run: async (client, m) => {

    // Imagen del menú (asegúrate de tenerla)
    const PP = fs.readFileSync("./media/menu.png");

    // ————————————————
    // 📌 Extraer categorías dinámicas
    // ————————————————
    const categorias = {};
    for (const [name, cmd] of global.comandos.entries()) {
      const cat = cmd.category || "otros";
      if (!categorias[cat]) categorias[cat] = [];
      categorias[cat].push(name);
    }

    // ————————————————
    // 📌 Construcción del menú
    // ————————————————
    let menuTexto = `🌙 *𝗠𝗘𝗡𝗨 𝗛𝗔𝗖𝗞𝗘𝗥 - 𝗠𝗜𝗡𝗜 𝗟𝗨𝗥𝗨𝗦*  
┈┈┈┈┈┈┈┈┈┈┈┈  
👤 *Usuario:* ${m.pushName}
📅 *Fecha:* ${new Date().toLocaleDateString()}
⌚ *Hora:* ${new Date().toLocaleTimeString()}
┈┈┈┈┈┈┈┈┈┈┈┈  
`;

    for (const cat of Object.keys(categorias)) {
      menuTexto += `\n🔥 *${cat.toUpperCase()}*\n`;
      categorias[cat].forEach(cmd => {
        menuTexto += `▪︎ .${cmd}\n`;
      });
    }

    // ————————————————
    // 📌 Menú con botones
    // ————————————————
    await client.sendMessage(m.chat, {
      image: PP,
      caption: menuTexto,
      footer: "Mini Lurus — Powered by Zam & Yerson",
      buttons: [
        { buttonId: ".menu", buttonText: { displayText: "📜 MENU" }, type: 1 },
        { buttonId: ".descargas", buttonText: { displayText: "⬇️ DESCARGAS" }, type: 1 },
        { buttonId: ".owner", buttonText: { displayText: "💻 OWNER" }, type: 1 }
      ],
      headerType: 4
    });
  }
};

