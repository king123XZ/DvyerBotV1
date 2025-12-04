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

    // Categorías que se mostrarán como botones
    const buttonCategories = ["Downloader", "General", "Entretenimiento", "Otros"];

    // Crear botones
    const buttons = buttonCategories.map(cat => ({
      buttonId: `category_${cat.toLowerCase()}`,
      buttonText: { displayText: cat },
      type: 1
    }));

    // Enviar imagen con botones
    await client.sendMessage(chatId, {
      image: buffer,
      caption: `╭───❮ Menú de comandos ❯───╮\n${ucapan}, ${m.pushName || "Usuario"}\nVersión: ${version}\n╰─────────────────────╯`,
      footer: "DevYer",
      buttons,
      headerType: 4
    });

    // Limpiar flag
    setTimeout(() => {
      delete menuSent[chatId];
    }, 10000);
  },

  handleButton: async (client, m) => {
    const chatId = m.chat;
    const payload = m.selectedButtonId;

    if (!payload.startsWith("category_")) return;

    const category = payload.replace("category_", "");
    const cmds = [...global.comandos.values()];

    // Filtrar solo comandos de la categoría seleccionada
    const commandsInCategory = cmds
      .filter(c => (c.category || "otros").toLowerCase() === category)
      .sort((a, b) => a.command[0].localeCompare(b.command[0])); // Orden alfabético

    if (!commandsInCategory.length) {
      return client.sendMessage(chatId, { text: `No hay comandos disponibles en la categoría *${category}*.` });
    }

    // Construir mensaje profesional
    let text = `╭───❮ Comandos: ${category.charAt(0).toUpperCase() + category.slice(1)} ❯───╮\n\n`;
    commandsInCategory.forEach(cmd => {
      text += `• !${cmd.command.join(', !')} → ${cmd.description || "Sin descripción"}\n`;
    });
    text += `\n╰──────────────────────────╯`;

    await client.sendMessage(chatId, { text });
  }
};

