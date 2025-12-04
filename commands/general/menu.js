const moment = require("moment-timezone");
const { version } = require("../../package.json");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const menuSent = {};

// Cargar todos los comandos dinámicamente
function loadCommands() {
  const commands = [];
  const categoriesPath = path.join(__dirname, "commands");
  fs.readdirSync(categoriesPath).forEach(catFolder => {
    const catPath = path.join(categoriesPath, catFolder);
    if (!fs.statSync(catPath).isDirectory()) return;
    fs.readdirSync(catPath).forEach(file => {
      if (!file.endsWith(".js")) return;
      const cmd = require(path.join(catPath, file));
      if (cmd.command) commands.push(cmd);
    });
  });
  return commands;
}

module.exports = {
  command: ["help", "ayuda", "menu"],
  description: "Muestra los comandos",
  category: "general",

  run: async (client, m, args) => {
    const chatId = m.chat;

    if (menuSent[chatId]) return;
    menuSent[chatId] = true;

    const cmds = loadCommands();

    const hour = parseInt(moment.tz("America/Mexico_City").format("HH"));
    const ucapan =
      hour < 5 ? "Buen día" :
      hour < 12 ? "Buen día" :
      hour < 19 ? "Buenas tardes" :
      "Buenas noches";

    let buffer;
    try {
      const response = await axios.get("https://i.ibb.co/JR8Qz9j6/20251204-0617-Retrato-Misterioso-Mejorado-remix-01kbmh4newf9k8r1r0bafmxr46.png", { responseType: "arraybuffer" });
      buffer = Buffer.from(response.data, "binary");
    } catch (e) {
      console.error("Error descargando la imagen:", e);
    }

    await delay(500);

    // Categorías fijas
    const buttonCategories = ["Downloader", "General", "Entretenimiento", "Otros"];

    const buttons = buttonCategories.map(cat => ({
      buttonId: `category_${cat.toLowerCase()}`,
      buttonText: { displayText: cat },
      type: 1
    }));

    await client.sendMessage(chatId, {
      image: buffer,
      caption: `╭───❮ Menú de comandos ❯───╮\n${ucapan}, ${m.pushName || "Usuario"}\nVersión: ${version}\n╰─────────────────────╯`,
      footer: "DevYer",
      buttons,
      headerType: 4
    });

    setTimeout(() => {
      delete menuSent[chatId];
    }, 10000);
  },

  handleButton: async (client, message) => {
    const chatId = message.chat;
    const payload = message.selectedButtonId;

    if (!payload.startsWith("category_")) return;

    const category = payload.replace("category_", "");
    const cmds = loadCommands();

    const commandsInCategory = cmds
      .filter(c => (c.category || "otros").toLowerCase() === category)
      .sort((a, b) => a.command[0].localeCompare(b.command[0]));

    if (!commandsInCategory.length) {
      return client.sendMessage(chatId, { text: `No hay comandos disponibles en la categoría *${category}*.` });
    }

    let text = `╭───❮ Comandos: ${category.charAt(0).toUpperCase() + category.slice(1)} ❯───╮\n\n`;
    commandsInCategory.forEach(cmd => {
      text += `• !${cmd.command.join(', !')} → ${cmd.description || "Sin descripción"}\n`;
    });
    text += `\n╰──────────────────────────╯`;

    await client.sendMessage(chatId, { text });
  }
};
