const moment = require("moment-timezone");
const { version } = require("../../package.json");
const axios = require("axios");

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Creamos un objeto para controlar si ya se envió el menú
const menuSent = {};

module.exports = {
  command: ["help", "ayuda", "menu"],
  description: "Muestra los comandos",
  category: "general",
  run: async (client, m, args) => {
    const chatId = m.chat;

    // Evitar duplicados
    if (menuSent[chatId]) return; // Si ya se envió, no hacer nada
    menuSent[chatId] = true;

    const cmds = [...global.comandos.values()];

    const jam = moment.tz("America/Mexico_City").format("HH:mm:ss");
    const ucapan =
      jam < "05:00:00"
        ? "Buen día"
        : jam < "11:00:00"
          ? "Buen día"
          : jam < "15:00:00"
            ? "Buenas tardes"
            : jam < "19:00:00"
              ? "Buenas tardes"
              : "Buenas noches";

    // Descargar imagen como buffer
    const imageUrl = "https://i.ibb.co/JR8Qz9j6/20251204-0617-Retrato-Misterioso-Mejorado-remix-01kbmh4newf9k8r1r0bafmxr46.png";
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data, "binary");

    // Enviar la imagen
    await client.sendMessage(chatId, {
      image: buffer,
      caption: `╭───❮ Menú de comandos ❯───╮\n${ucapan}, ${m.pushName || "Usuario"}\nVersión: ${version}\n╰─────────────────────╯`
    });

    // Esperar 3 segundos
    await delay(3000);

    // Organizar comandos por categoría
    const categories = {};
    cmds.forEach((cmd) => {
      if (!cmd.command) return;
      const cat = (cmd.category || "sin categoría").toLowerCase();
      if (!categories[cat]) categories[cat] = [];
      if (!categories[cat].some((c) => c.command[0] === cmd.command[0])) {
        categories[cat].push(cmd);
      }
    });

    // Construir secciones de la lista
    const sections = Object.entries(categories).map(([cat, commands]) => ({
      title: cat.charAt(0).toUpperCase() + cat.slice(1),
      rows: commands.map((cmd) => ({
        title: `!${cmd.command[0]}`,
        description: cmd.description || "",
        rowId: `!${cmd.command[0]}`
      }))
    }));

    // Lista final
    const listMessage = {
      text: "Selecciona un comando de la lista 👇",
      footer: "Creador: +52 33 3232 9453",
      buttonText: "Ver comandos",
      sections
    };

    // Enviar la lista
    await client.sendMessage(chatId, listMessage);

    // Limpiar flag después de 10 segundos para permitir enviar otra vez si quieres
    setTimeout(() => {
      delete menuSent[chatId];
    }, 10000);
  },
};
