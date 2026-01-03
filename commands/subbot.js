const { startSubBot } = require('../lib/startSubBot'); 

module.exports = {
  command: ["subbot", "vincular"],
  run: async (client, m, args) => {
    const userNumber = args[0];
    if (!userNumber) return m.reply("❌ Uso: .subbot 51900111222");

    await m.reply("⏳ Conectando con el alojamiento SkyUltraPlus...");

    try {
        await startSubBot(client, m, userNumber);
    } catch (e) {
        m.reply("❌ Error de sistema al intentar vincular.");
    }
  },
};
