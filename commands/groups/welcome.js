module.exports = {
  command: ["welcome"],
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,

  run: async (client, m, args) => {
    const id = m.chat;

    if (!global.db.data.groups[id]) {
      global.db.data.groups[id] = {
        welcome: false,
        welcomeText: "👋 Bienvenido @user\n📌 Grupo: @group\n👥 Miembros: @count",
        welcomeImage: null
      };
    }

    const group = global.db.data.groups[id];

    if (!args[0]) {
      return m.reply(
        `⚙️ *CONFIGURACIÓN BIENVENIDA*\n\n` +
        `Estado: ${group.welcome ? "🟢 Activado" : "🔴 Desactivado"}\n\n` +
        `📌 Comandos:\n` +
        `!welcome on\n` +
        `!welcome off\n` +
        `!welcome text <mensaje>\n` +
        `!welcome image (responde a una imagen)`
      );
    }

    // ON
    if (args[0] === "on") {
      group.welcome = true;
      return m.reply("✅ Bienvenida activada.");
    }

    // OFF
    if (args[0] === "off") {
      group.welcome = false;
      return m.reply("❌ Bienvenida desactivada.");
    }

    // TEXTO
    if (args[0] === "text") {
      const text = args.slice(1).join(" ");
      if (!text) return m.reply("⚠️ Escribe el mensaje.");

      group.welcomeText = text;
      return m.reply("✅ Mensaje actualizado.");
    }

    // IMAGEN
    if (args[0] === "image") {
      const quoted = m.quoted;
      if (!quoted || !quoted.message?.imageMessage) {
        return m.reply("⚠️ Responde a una imagen.");
      }

      const img = await client.downloadAndSaveMediaMessage(quoted, "welcome");
      group.welcomeImage = img;

      return m.reply("🖼 Imagen de bienvenida guardada.");
    }
  }
};
