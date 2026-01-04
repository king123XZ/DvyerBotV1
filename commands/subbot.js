const { startSubBot } = require("../lib/starSubBot");

module.exports = {
  name: "subbot",
  alias: ["botsub", "vincular"],
  category: "owner",
  cooldown: 30,

  async run(client, m) {
    try {
      // 🔐 Solo privado (recomendado)
      if (m.isGroup) {
        return m.reply("⚠️ Usa este comando en privado.");
      }

      // 📲 TOMAMOS EL NÚMERO AUTOMÁTICAMENTE
      const senderJid = m.sender;
      const userNumber = senderJid.split("@")[0];

      await m.reply(
        "🤖 *Creando tu SubBot...*\n\n" +
        "📲 Tu número fue detectado automáticamente.\n" +
        "⏳ Espera unos segundos, se enviará tu código."
      );

      // 🚀 INICIAR SUBBOT
      await startSubBot(client, m, userNumber);

    } catch (e) {
      console.error("Error comando subbot:", e);
      m.reply("❌ Error al crear tu subbot.");
    }
  }
};