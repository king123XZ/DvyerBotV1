const moment = require("moment-timezone");
const { version } = require("../../package.json");

module.exports = {
  command: ["help", "ayuda", "menu", "comandos"],
  description: "Muestra el menú completo del bot",
  category: "general",

  run: async (client, m, args) => {
    const chatId = m.chat;

    // Hora y saludo
    const hour = parseInt(moment.tz("America/Mexico_City").format("HH"));
    const saludo =
      hour < 5 ? "🌙 Buenas madrugadas" :
      hour < 12 ? "🌅 Buenos días" :
      hour < 19 ? "🌇 Buenas tardes" :
      "🌙 Buenas noches";

    // Obtener todos los comandos
    const cmds = [...global.comandos.values()];

    // Categorías con iconos PRO
    const iconos = {
      downloader: "⬇️",
      general: "🧭",
      entretenimiento: "🎭",
      info: "📘",
      utilidad: "⚙️",
      otros: "📁"
    };

    // Organizar comandos por categoría
    const categorias = {};
    cmds.forEach(cmd => {
      const cat = (cmd.category || "otros").toLowerCase();
      if (!categorias[cat]) categorias[cat] = [];
      categorias[cat].push(cmd);
    });

    // 🎨 MENÚ PRO
    let menu = `
╭━━━〔 *𝗠𝗘𝗡𝗨 𝗣𝗥𝗢* 〕━━━╮
┃ 👋 ${saludo}, *${m.pushName || "Usuario"}*
┃ 🚀 Versión del bot: *${version}*
┃ 👑 Creador: *DevYer*
╰━━━━━━━━━━━━━━━━━━━━━━╯
`;

    // Agregar categorías al menú
    for (const cat in categorias) {
      const icon = iconos[cat] || "📁";

      menu += `\n┌─── ${icon} *${cat.toUpperCase()}*\n`;

      categorias[cat].forEach(cmd => {
        menu += `│ • *!${cmd.command.join(", !")}*\n│    ${cmd.description}\n`;
      });

      menu += "└──────────────────────\n";
    }

    menu += `\n✨ Para usar un comando escribe: *!comando*\n`;

    // Enviar menú
    await client.sendMessage(chatId, { text: menu });
  }
};
