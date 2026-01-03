const { startSubBot } = require('../lib/subBotManager'); 

module.exports = {
    name: 'subbot',
    category: 'owner',
    async execute(client, m, args) {
        // Validación de número
        const userNumber = args[0];
        if (!userNumber || isNaN(userNumber)) {
            return m.reply("❌ Por favor indica el número con código de país.\nEjemplo: `.subbot 51900123456`");
        }

        m.reply("⏳ Procesando solicitud... Generando tu código de vinculación.");

        try {
            await startSubBot(client, m, userNumber);
        } catch (e) {
            console.error(e);
            m.reply("❌ Ocurrió un fallo al intentar iniciar el subbot. Revisa la consola.");
        }
    }
};
