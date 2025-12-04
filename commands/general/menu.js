const moment = require("moment-timezone");
const { version } = require("../../package.json");
const axios = require("axios");

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Objeto para controlar si ya se envió el menú
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

    // Descargar imagen como buffer
    let buffer;
    try {
      const response = await axios.get("https://i.ibb.co/JR8Qz9j6/20251204-0617-Retrato-Misterioso-Mejorado-remix-01kbmh4newf9k8r1r0bafmxr46.png", { responseType: "arraybuffer" });
      buffer = Buffer.from(response.data, "binary");
    } catch (e) {
      console.error("Error descargando la imagen:", e);
    }

    // Enviar la imagen primero
    if (buffer) {
      await client.sendMessage(chatId, {
        image: buffer,
        caption: `╭───❮ Menú de comandos ❯───╮\n${ucapan}, ${m.pushName || "Usuario"}\nVersión: ${version}\n╰─────────────────────╯`
      });
    }

    await delay(3000);

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

    // Detectar si es grupo
    const isGroup = chatId.endsWith("@g.us");

    // Verificar si el bot es administrador (para enviar lista interactiva en grupo)
    let isAdmin = false;
    if (isGroup) {
      try {
        const metadata = await client.groupMetadata(chatId);
        const botId = client.user.id.split(":")[0] + "@s.whatsapp.net";
        isAdmin = metadata.participants.some(p => p.id === botId && (p.admin === "admin" || p.admin === "superadmin"));
      } catch (e) {
        console.error("Error obteniendo metadata del grupo:", e);
      }
    }

    if (!isGroup || isAdmin) {
      // Privado o grupo admin: lista interactiva
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
      // Grupo sin admin: enviar menú en texto plano
      let text = "╭───❮ Menú de comandos ❯───╮\n";
      text += `${ucapan}, ${m.pushName || "Usuario"}\nVersión: ${version}\n╰─────────────────────╯\n\n`;
      Object.entries(categories).forEach(([cat, commands]) => {
        text += `*${cat.charAt(0).toUpperCase() + cat.slice(1)}*\n`;
        commands.forEach(cmd => {
          text += `- !${cmd.command.join(', !')} : ${cmd.description || ""}\n`;
        });
        text += "\n";
      });
      await client.sendMessage(chatId, { text });
    }

    // Limpiar flag después de 10 segundos
    setTimeout(() => {
      delete menuSent[chatId];
    }, 10000);
  },
};
