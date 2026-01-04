const { startSubBot } = require("../lib/startSubBot");

module.exports = {
  name: "subbot",
  alias: ["botsub", "vincular"],
  category: "owner",
  cooldown: 30,

  async run(client, m) {
    try {
      if (m.isGroup) {
        return m.reply("⚠️ Usa este comando en privado.");
      }

      const userNumber = m.sender.split("@")[0];

      await m.reply(
        "🤖 *Creando tu SubBot...*\n" +
        "📲 Número detectado automáticamente.\n" +
        "⏳ Enviando código..."
      );

      await startSubBot(client, m, userNumber);

    } catch (e) {
      console.error("Error subbot:", e);
      m.reply("❌ Error al crear el subbot.");
    }
  }
};