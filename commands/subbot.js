const { startSubBot } = require('../lib/subBotManager'); 

module.exports = {
  // Ahora el Loader sí lo reconocerá porque usa el formato correcto de tu bot
  command: ["subbot", "vincular"],

  run: async (client, m, args) => {
    // Tomamos el número de los argumentos
    const userNumber = args[0];

    if (!userNumber) {
      return m.reply("❌ Por favor indica el número con código de país.\nEjemplo: `.subbot 51900123456`.");
    }

    // Confirmación visual
    await client.sendMessage(m.chat, { text: "⏳ Procesando instancia... Solicitando código de vinculación a WhatsApp." }, { quoted: m });

    try {
      // Llamamos a la función mágica que creamos en lib/subBotManager.js
      await startSubBot(client, m, userNumber);
    } catch (e) {
      console.error("ERROR EN SUBBOT:", e);
      m.reply("❌ Ocurrió un error al intentar generar el código.");
    }
  },
};
