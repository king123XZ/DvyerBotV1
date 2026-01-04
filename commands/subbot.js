const { startSubBot } = require("../lib/startSubBot");
const mainHandler = require("../main");

module.exports = {
  name: "subbot",
  command: ["subbot"],
  category: "owner",
  isOwner: true,

  run: async (client, m) => {
    const sender = m.sender.replace(/[^0-9]/g, "");

    await m.reply("📲 Creando subbot...");

    try {
      await startSubBot({
        number: sender,
        mainHandler
      });

      await m.reply("✅ Subbot iniciado. Revisa el código de vinculación.");
    } catch (e) {
      console.log(e);
      m.reply("❌ Error al crear subbot.");
    }
  }
};