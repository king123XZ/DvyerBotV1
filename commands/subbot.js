const { startSubBot } = require("../lib/startSubBot");
const mainHandler = require("../main");

module.exports = {
  command: ["subbot"],
  category: "owner",

  run: async (client, m) => {
    const number = m.sender.split("@")[0];

    await m.reply("⏳ Generando código de subbot...");

    try {
      const { code } = await startSubBot(number, mainHandler);

      if (code) {
        await m.reply(
          `📲 *Vinculación SubBot*\n\n` +
          `🔢 Número: ${number}\n` +
          `🔐 Código: *${code}*\n\n` +
          `📱 WhatsApp → Dispositivos vinculados`
        );
      } else {
        await m.reply("✅ Subbot ya conectado");
      }
    } catch (e) {
      await m.reply("❌ Error creando subbot");
      console.log(e);
    }
  }
};