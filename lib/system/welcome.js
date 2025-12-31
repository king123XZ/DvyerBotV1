module.exports = async (client, update) => {
  try {
    const { id, participants, action } = update;
    if (!id || !participants) return;

    // ===== DB SAFE =====
    if (!global.db.data.chats[id]) {
      global.db.data.chats[id] = {
        welcome: {
          enabled: false,
          text: "👋 Bienvenido @user a *{group}*\n👥 Miembros: {count}",
          image: null
        }
      };
    }

    const chat = global.db.data.chats[id];
    if (!chat.welcome || !chat.welcome.enabled) return;

    // ===== GROUP INFO =====
    const metadata = await client.groupMetadata(id);
    const groupName = metadata.subject;
    const membersCount = metadata.participants.length;

    for (const user of participants) {
      const isAdmin = metadata.participants.find(p => p.id === user)?.admin;

      // ===== TEXTO SEGURO =====
      let text = chat.welcome.text || 
        "👋 Bienvenido @user a *{group}*\n👥 Miembros: {count}";

      text = text
        .replace(/@user/g, `@${user.split("@")[0]}`)
        .replace(/{group}/g, groupName)
        .replace(/{count}/g, membersCount);

      if (isAdmin) {
        text += "\n👑 *Este usuario es admin*";
      }

      // ===== MENSAJE =====
      const msg = {
        text,
        mentions: [user],
        footer: "🤖 DevYer Bot",
        buttons: [
          { buttonId: ".menu", buttonText: { displayText: "📜 Menú" }, type: 1 },
          { buttonId: ".rules", buttonText: { displayText: "📌 Reglas" }, type: 1 }
        ],
        headerType: 1
      };

      // ===== IMAGEN OPCIONAL =====
      if (chat.welcome.image) {
        await client.sendMessage(id, {
          image: { url: chat.welcome.image },
          caption: text,
          mentions: [user]
        });
      } else {
        await client.sendMessage(id, msg);
      }
    }
  } catch (err) {
    console.log("❌ Error welcome:", err);
  }
};
