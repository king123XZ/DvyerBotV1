const moment = require("moment-timezone");
const { version } = require("../../package.json");
const axios = require("axios");
const path = require("path");

// Función para delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Control de menú enviado para evitar duplicados
const menuSent = {};

module.exports = {
  command: ["help", "ayuda", "menu"],
  description: "Muestra los comandos",
  category: "general",

  run: async (client, m, args) => {
    const chatId = m.chat;

    if (menuSent[chatId]) return;
    menuSent[chatId] = true;

    // Saludo según hora
    const hour = parseInt(moment.tz("America/Mexico_City").format("HH"));
    const ucapan =
      hour < 5 ? "Buen día" :
      hour < 12 ? "Buen día" :
      hour < 19 ? "Buenas tardes" :
      "Buenas noches";

    // Descargar imagen del menú
    let buffer;
    try {
      const response = await axios.get(
        "https://i.ibb.co/JR8Qz9j6/20251204-0617-Retrato-Misterioso-Mejorado-remix-01kbmh4newf9k8r1r0bafmxr46.png",
        { responseType: "arraybuffer" }
      );
      buffer = Buffer.from(response.data, "binary");
    } catch (e) {
      console.error("Error descargando la imagen:", e);
    }

    await delay(500);

    // Categorías predefinidas para botones
    const buttonCategories = ["Downloader", "General", "Entretenimiento", "Otros"];

    // Crear botones dinámicos
    const buttons = buttonCategories.map(cat => ({
      buttonId: `category_${cat.toLowerCase()}`,
      buttonText: { displayText: cat },
      type: 1
    }));

    // Enviar imagen con botones
    await client.sendMessage(chatId, {
      image: buffer,
      caption:
`╭───❮ Menú de comandos ❯───╮
${ucapan}, ${m.pushName || "Usuario"}
Versión: ${version}
╰─────────────────────╯`,
      footer: "DevYer",
      buttons,
      headerType: 4
    });

    // Limpiar flag después de 10 segundos
    setTimeout(() => {
      delete menuSent[chatId];
    }, 10000);
  },

  // Función para manejar botón pulsado
  handleButton: async (client, message) => {
    const chatId = message.chat;
    const payload = message.selectedButtonId;

    if (!payload.startsWith("category_")) return;

    const category = payload.replace("category_", "");

    let commandsInCategory = [];

    // ============================
    // 📂 CATEGORÍA: DOWNLOADER
    // ============================
    if (category === "downloader") {
      try {
        commandsInCategory = require(path.join(__dirname, "../comandos-descarga.js"));
      } catch (e) {
        console.error("❌ Error cargando comandos-descarga.js:", e);
        return client.sendMessage(chatId, { text: "Error cargando comandos de descargas." });
      }
    }

    // ============================
    // 📂 OTRAS CATEGORÍAS
    // ============================
    else {
      const cmds = [...global.comandos.values()];
      commandsInCategory = cmds.filter(
        c => (c.category || "otros").toLowerCase() === category
      );
    }

    // Sin comandos
    if (!commandsInCategory.length) {
      return client.sendMessage(chatId, { text: `⚠️ No hay comandos disponibles en la categoría *${category}*.` });
    }

    // Crear mensaje profesional con los comandos
    let text = `╭───❮ Comandos: ${category.toUpperCase()} ❯───╮\n\n`;

    commandsInCategory.forEach(cmd => {
      text += `• !${cmd.command.join(', !')} → ${cmd.description || "Sin descripción"}\n`;
    });

    text += `\n╰──────────────────────────╯`;

    await client.sendMessage(chatId, { text });
  }
};
