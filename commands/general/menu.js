const moment = require("moment-timezone");
const axios = require("axios");

module.exports = {
  command: ["menu", "help", "ayuda"],
  description: "Muestra el menú estilo hacker oscuro",
  category: "general",

  run: async (client, m) => {
    const chatId = m.chat;
    const { version } = require("../../package.json");

    // SALUDO SEGÚN HORA
    const hour = parseInt(moment.tz("America/Mexico_City").format("HH"));
    const saludo =
      hour < 5 ? "⌁ Noche Profunda" :
      hour < 12 ? "⌁ Buenos Días" :
      hour < 19 ? "⌁ Buenas Tardes" :
      "⌁ Buenas Noches";

    // DESCARGAR LA IMAGEN DEL BANNER
    let banner;
    try {
      const res = await axios.get(
        "https://i.ibb.co/JR8Qz9j6/20251204-0617-Retrato-Misterioso-Mejorado-remix-01kbmh4newf9k8r1r0bafmxr46.png",
        { responseType: "arraybuffer" }
      );
      banner = Buffer.from(res.data, "binary");
    } catch (err) {
      console.error("Error descargando banner:", err);
    }

    // OBTENER TODOS LOS COMANDOS
    const allCmds = [...global.comandos.values()];

    // ICONOS HACKER POR CATEGORÍA
    const iconos = {
      downloader: "▣",
      general: "◇",
      entretenimiento: "◆",
      utilidad: "○",
      info: "◎",
      otros: "▪"
    };

    // ORGANIZAR POR CATEGORÍA
    const categorias = {};
    allCmds.forEach(cmd => {
      const cat = (cmd.category || "otros").toLowerCase();
      if (!categorias[cat]) categorias[cat] = [];
      categorias[cat].push(cmd);
    });

    // DISEÑO HACKER DARK
    let menu = `
𖤐═━「 *DARK SYSTEM ONLINE* 」━═𖤐

⚫ Estado: *ACTIVO*
⚫ Usuario: *${m.pushName || "Desconocido"}*
⚫ Versión: *${version}*
⚫ Hora del sistema: ${saludo}

⛧ *CATEGORIES LOADED:*  
`;

    // LISTAR CATEGORÍAS Y COMANDOS
    for (const cat in categorias) {
      const symbol = iconos[cat] || "▪";

      menu += `\n${symbol}  *${cat.toUpperCase()}*\n`;

      categorias[cat].forEach(cmd => {
        menu += `   ╰─ ⟦ !${cmd.command.join(", !")} ⟧  
       ↳ ${cmd.description}\n`;
      });
    }

    menu += `
━━━━━━━━━━━━━━━━━━━━
⌁ *USA:* !comando  
⌁ Modo: Hacker Oscuro  
━━━━━━━━━━━━━━━━━━━━
`;

    // ENVÍO FINAL (IMAGEN + MENÚ)
    await client.sendMessage(chatId, {
      image: banner,
      caption: menu
    });
  }
};
