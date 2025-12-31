const fs = require("fs");

module.exports = async (client, update) => {
  try {
    const { id, participants, action } = update;

    // solo grupos
    if (!id || !id.endsWith("@g.us")) return;

    // 🔒 inicializar DB SIEMPRE
    if (!global.db.data.chats) global.db.data.chats = {};

    if (!global.db.data.chats[id]) {
      global.db.data.chats[id] = {
        welcome: false,
        welcomeText: "👋 Bienvenido @user a *{group}*\n👥 Miembros: {count}",
        welcomeAdminText: "👑 El admin @user se unió a *{group}*",
        welcomeImage: null
      };
    }

    const chat = global.db.data.chats[id];
    if (!chat.welcome) return;

    // metadata actualizada (contador REAL)
    const metadata = await client.groupMetadata(id);
    const groupName = metadata.subject;
    const count = metadata.participants.length;

    for (let user of participants) {
      const isAdmin = metadata.participants.find(
        p => p.id === user && (p.admin === "admin" || p.admin === "superadmin")
      );

      let text = isAdmin
        ? chat.welcomeAdminText
        : chat.welcomeText;

      text = text
        .replace(/@user/g, `@${user.split("@")[0]}`)
        .replace(/{group}/g, groupName)
        .replace(/{count}/g, count);

      const msg = {
        caption: text,
        mentions: [user],
        buttons: [
          { buttonId: "menu", buttonText: { displayText: "📜 MENU" }, type: 1 },
          { buttonId: "reglas", buttonText: { displayText: "📌 REGLAS" }, type: 1 }
        ],
        headerType: 4
      };

      // con imagen personalizada
      if (chat.welcomeImage && fs.existsSync(chat.welcomeImage)) {
        msg.image = fs.readFileSync(chat.welcomeImage);
        await client.sendMessage(id, msg);
      } else {
        await client.sendMessage(id, { text, mentions: [user] });
      }
    }
  } catch (e) {
    console.log("❌ Error welcome:", e);
  }
};
