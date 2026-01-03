const { startSubBot } = require('../lib/startSubBot'); 

module.exports = {
  command: ["subbot", "vincular"],
  run: async (client, m, args) => {
    const userNumber = args[0];
    if (!userNumber) return m.reply("❌ Uso: .subbot 51900111222");

    await m.reply("⏳ Solicitando vinculación al servidor SkyUltraPlus...");

    try {
        await startSubBot(client, m, userNumber);
    } catch (e) {
        m.reply("❌ Error al conectar con el alojamiento.");
    }
  },
};
