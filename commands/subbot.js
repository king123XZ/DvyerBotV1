const { startSubBot } = require('../lib/startSubBot');

module.exports = {
    name: 'subbot',
    category: 'owner',
    async execute(client, m, args) {
        // Validar si es el owner (ajusta según tu sistema)
        if (!m.isOwner) return m.reply("Solo el dueño puede usar esto.");

        const userNumber = args[0]; // Ejemplo: .subbot 51900XXX
        if (!userNumber) return m.reply("Indica el número. Ej: .subbot 54911...");

        m.reply("⏳ Generando código de vinculación, espera...");
        
        try {
            await startSubBot(client, m, userNumber);
        } catch (e) {
            m.reply(`❌ Fallo crítico: ${e.message}`);
        }
    }
};
