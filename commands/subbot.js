const { startSubBot } = require("../lib/startSubBot");
const mainHandler = require("../main");

module.exports = {
  name: "subbot",
  command: ["subbot"],
  isOwner: true,

  run: async (client, m) => {
    const number = m.sender.replace(/[^0-9]/g, "");

    await m.reply("📲 Iniciando subbot...");

    try {
      await startSubBot(number, mainHandler);
      await m.reply("✅ Subbot creado. Revisa el código de vinculación.");
    } catch (e) {
      console.log(e);
      await m.reply("❌ Error al crear subbot.");
    }
  }
};