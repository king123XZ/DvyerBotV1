module.exports = {
  command: ["menu", "help", "ayuda"],
  description: "Muestra el menú del bot",
  category: "general",

  run: async (client, m) => {

    const PP = fs.readFileSync("./media/menu.jpg")

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
    // 📌 Construir menú automáticamente
    // ————————————————
    let menuTexto = `🌙 *𝗠𝗜𝗡𝗜 𝗟𝗨𝗥𝗨𝗦 - 𝗠𝗘𝗡𝗨 𝗛𝗔𝗖𝗞𝗘𝗥*  
┈┈┈┈┈┈┈┈┈┈┈┈  
👤 *Usuario:* ${m.pushName}
📅 *Fecha:* ${new Date().toLocaleDateString()}
⌚ *Hora:* ${new Date().toLocaleTimeString()}
┈┈┈┈┈┈┈┈┈┈┈┈  
`;

    for (const cat of Object.keys(categorias)) {
      menuTexto += `\n🔥 𝗖𝗔𝗧𝗘𝗚𝗢𝗥𝗜𝗔: *${cat.toUpperCase()}*\n`;
      categorias[cat].forEach(cmd => {
        menuTexto += `▪︎ ${global.prefijo}${cmd}\n`;
      });
    }

    // ————————————————
    // 📌 Enviar menú con botones
    // ————————————————
    await client.sendMessage(m.chat, {
      image: PP,
      caption: menuTexto,
      footer: "Mini Lurus — Powered by Zam & Yerson",
      buttons: [
        { buttonId: "menu", buttonText: { displayText: "📜 MENU" }, type: 1 },
        { buttonId: "downloader", buttonText: { displayText: "⬇️ DESCARGAS" }, type: 1 },
        { buttonId: "owner", buttonText: { displayText: "💻 OWNER" }, type: 1 }
      ],
      headerType: 4
    });
  }
};
