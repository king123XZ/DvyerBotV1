const fs = require("fs");

module.exports = async (client, update) => {
  try {
    const { id, participants, action } = update;

    if (!global.db.data.groups[id]) {
      global.db.data.groups[id] = {
        welcome: false,
        welcomeText: "👋 Bienvenido @user\n📌 Grupo: @group\n👥 Miembros: @count",
        welcomeImage: null
      };
    }

    const groupData = global.db.data.groups[id];
    if (!groupData.welcome) return;

    const metadata = await client.groupMetadata(id);
    const groupName = metadata.subject;
    const count = metadata.participants.length;

    for (const user of participants) {
      const number = user.split("@")[0];

      const text = groupData.welcomeText
        .replace(/@user/g, `@${number}`)
        .replace(/@group/g, groupName)
        .replace(/@count/g, count);

      // ENTRÓ
      if (action === "add") {
        if (groupData.welcomeImage) {
          await client.sendMessage(id, {
            image: { url: groupData.welcomeImage },
            caption: text,
            mentions: [user]
          });
        } else {
          await client.sendMessage(id, {
            text,
            mentions: [user]
          });
        }
      }

      // SALIÓ
      if (action === "remove") {
        await client.sendMessage(id, {
          text: `👋 @${number} salió del grupo\n👥 Quedan ${count - 1}`,
          mentions: [user]
        });
      }
    }
  } catch (e) {
    console.log("❌ Error welcome:", e);
  }
};
