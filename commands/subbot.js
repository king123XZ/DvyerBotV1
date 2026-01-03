const { startSubBot } = require('../lib/subBotManager'); 

module.exports = {
    name: 'subbot',
    alias: ['vincular'],
    async execute(client, m, args) {
        // El número debe incluir código de país sin el símbolo +
        const userNumber = args[0];
        if (!userNumber) return m.reply("❌ Uso: .subbot 519XXXXXXXX");

        m.reply("⏳ Iniciando instancia... solicitando código a WhatsApp.");

        try {
            // Lanza la función sin bloquear el bot principal
            await startSubBot(client, m, userNumber);
        } catch (e) {
            m.reply("❌ Error crítico al iniciar sesión secundaria.");
            console.log(e);
        }
    }
};
