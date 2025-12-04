const moment = require("moment-timezone");
const { version } = require("../../package.json");
const axios = require("axios");

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Control de menú enviado
const menuSent = {};

module.exports = {
  command: ["help", "ayuda", "menu"],
  description: "Muestra los comandos",
  category: "general",
  run: async (client, m, args) => {
    const chatId = m.chat;

    // Evitar duplicados
    if (menuSent[chatId]) return;
    menuSent[chatId] = true;

    const cmds = [...global.comandos.values()];

    const hour = parseInt(moment.tz("America/Mexico_City").format("HH"));
    const ucapan =
      hour < 5 ? "Buen día" :
      hour < 12 ? "Buen día" :
      hour < 19 ? "Buenas tardes" :
      "Buenas noches";

    // Descargar imagen
    let buffer;
    try {
      const response = await axios.get("https://i.ibb.co/JR8Qz9j6/20251204-0617-Retrato-Misterioso-Mejorado-remix-01kbmh4newf9k8r1r0bafmxr46.png", { responseType: "arraybuffer" });
      buffer = Buffer.from(response.data, "binary");
    } catch (e) {
      console.error("Error descargando la imagen:", e);
    }

    await delay(500);

    // Organizar comandos por categoría
    const categories = {};
    cmds.forEach(cmd => {
      if (!cmd.command) return;
      const cat = (cmd.category || "sin categoría").toLowerCase();
      if (!categories[cat]) categories[cat] = [];
      if (!categories[cat].some(c => c.command[0] === cmd.command[0])) {
        categories[cat].push(cmd);
      }
    });

    const isGroup = chatId.endsWith("@g.us");

    if (!isGroup) {
      // Privado: lista interactiva
      const sections = Object.entries(categories).map(([cat, commands]) => ({
        title: cat.charAt(0).toUpperCase() + cat.slice(1),
        rows: commands.map(cmd => ({
          title: `!${cmd.command.join(', !')}`,
          description: cmd.description || "",
          rowId: `!${cmd.command[0]}`
        }))
      }));

      const listMessage = {
        text: "Selecciona un comando de la lista 👇",
        footer: "DevYer",
        buttonText: "Ver comandos",
        sections
      };

      await client.sendMessage(chatId, listMessage);
    } else {
      // Grupo: botones con imagen (headerType: 4)
      const buttons = Object.keys(categories).map(cat => ({
        buttonId: `category_${cat}`,
        buttonText: { displayText: cat.charAt(0).toUpperCase() + cat.slice(1) },
        type: 1
      }));

      await client.sendMessage(chatId, {
        image: buffer,
        caption: `╭───❮ Menú de comandos ❯───╮\n${ucapan}, ${m.pushName || "Usuario"}\nVersión: ${version}\n╰─────────────────────╯`,
        footer: "DevYer",
        buttons,
        headerType: 4
      });
    }

    setTimeout(() => {
      delete menuSent[chatId];
    }, 10000);
  },

  // Función para manejar botón pulsado en grupo
  handleButton: async (client, m) => {
    const chatId = m.chat;
    const payload = m.selectedButtonId;

    if (!payload.startsWith("category_")) return;

    const category = payload.replace("category_", "");
    const cmds = [...global.comandos.values()];
    const commandsInCategory = cmds.filter(c => (c.category || "sin categoría").toLowerCase() === category);

    if (!commandsInCategory.length) return;

    let text = `*${category.charAt(0).toUpperCase() + category.slice(1)}*\n\n`;
    commandsInCategory.forEach(cmd => {
      text += `- !${cmd.command.join(', !')} : ${cmd.description || ""}\n`;
    });

    await client.sendMessage(chatId, { text });
  }
};

