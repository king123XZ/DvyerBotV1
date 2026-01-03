const { startSubBot } = require('../lib/subBotManager'); 

module.exports = {
  command: ["subbot", "vincular"],
  run: async (client, m, args) => {
    const userNumber = args[0];

    if (!userNumber) {
      return m.reply("❌ Por favor indica el número con código de país.\nEjemplo: `.subbot 51900123456`.");
    }

    // Reacción para confirmar que el bot recibió la orden
    await client.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    await m.reply("🔄 Solicitando código de vinculación... espera unos segundos.");

    try {
      await startSubBot(client, m, userNumber);
    } catch (e) {
      console.error("ERROR EN SUBBOT:", e);
      m.reply("❌ Ocurrió un error al intentar generar el código.");
    }
  },
};
