module.exports = {
  command: ["welcome"],
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,

  run: async (client, m, args) => {

    // 🔒 ASEGURAR DB
    if (!global.db.data) await global.loadDatabase();

    // 🔧 INICIALIZAR CHAT
    if (!global.db.data.chats[m.chat]) {
      global.db.data.chats[m.chat] = {
        welcome: false,
        welcomeText: "👋 Bienvenido @user a *{group}*",
        welcomeAdminText: "👑 El admin @user se unió a *{group}*",
        welcomeImage: null
      };
    }

    const chat = global.db.data.chats[m.chat];

    if (!args[0]) {
      return m.reply(
        `⚙️ *WELCOME CONFIG*\n\n` +
        `Estado: ${chat.welcome ? "ON ✅" : "OFF ❌"}\n\n` +
        `Comandos:\n` +
        `!welcome on\n` +
        `!welcome off\n` +
        `!welcome text <mensaje>\n` +
        `!welcome admin <mensaje>\n` +
        `!welcome img (responde a imagen)`
      );
    }

    if (args[0] === "on") {
      chat.welcome = true;
      return m.reply("✅ Bienvenida activada");
    }

    if (args[0] === "off") {
      chat.welcome = false;
      return m.reply("❌ Bienvenida desactivada");
    }

    if (args[0] === "text") {
      chat.welcomeText = args.slice(1).join(" ");
      return m.reply("✅ Texto de bienvenida actualizado");
    }

    if (args[0] === "admin") {
      chat.welcomeAdminText = args.slice(1).join(" ");
      return m.reply("✅ Texto de bienvenida para admins actualizado");
    }

    if (args[0] === "img") {
      if (!m.quoted || !m.quoted.imageMessage)
        return m.reply("❌ Responde a una imagen");

      const buffer = await m.quoted.download();
      const fs = require("fs");

      if (!fs.existsSync("./media")) fs.mkdirSync("./media");

      const path = `./media/welcome_${m.chat}.jpg`;
      fs.writeFileSync(path, buffer);

      chat.welcomeImage = path;
      return m.reply("🖼 Imagen de bienvenida guardada");
    }
  }
};
