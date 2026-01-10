module.exports = {
  command: ["welcome"],
  categoria: "grupos",
  isGroup: true,
  isAdmin: true,

  run: async (client, m, args) => {
    const id = m.chat;

    if (!global.db.data.chats[id]) {
      global.db.data.chats[id] = {
        welcome: false,
        welcomeText: "👋 Bienvenido @user a *{group}*\n👥 Miembros: {count}",
        welcomeAdminText: "👑 El admin @user se unió a *{group}*",
        welcomeImage: null
      };
    }

    const chat = global.db.data.chats[id];

    if (!args[0])
      return m.reply("⚙️ Usa:\n• welcome on\n• welcome off\n• welcome setmsg <texto>\n• welcome setadmin <texto>\n• welcome setimg");

    if (args[0] === "on") {
      chat.welcome = true;
      return m.reply("✅ Bienvenida ACTIVADA");
    }

    if (args[0] === "off") {
      chat.welcome = false;
      return m.reply("❌ Bienvenida DESACTIVADA");
    }

    if (args[0] === "setmsg") {
      chat.welcomeText = args.slice(1).join(" ");
      return m.reply("✏️ Mensaje de bienvenida actualizado");
    }

    if (args[0] === "setadmin") {
      chat.welcomeAdminText = args.slice(1).join(" ");
      return m.reply("👑 Mensaje para admins actualizado");
    }

    if (args[0] === "setimg") {
      if (!m.quoted || !m.quoted.mimetype?.includes("image"))
        return m.reply("📸 Responde a una imagen");

      const buffer = await m.quoted.download();
      const path = `./media/welcome_${id}.jpg`;

      fs.writeFileSync(path, buffer);
      chat.welcomeImage = path;

      return m.reply("🖼 Imagen de bienvenida guardada");
    }
  }
};
