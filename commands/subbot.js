const { startSubBot } = require('../lib/startSubBot');

module.exports = {
    command: ["subbot"],
    run: async (client, m, args) => {
        const userNumber = args[0];
        if (!userNumber) return m.reply("❌ Indica el número. Ejemplo: `.subbot 51900123456`.");
        
        try {
            await startSubBot(client, m, userNumber);
        } catch (e) {
            console.log(e);
            m.reply("❌ Error al intentar conectar con el alojamiento.");
        }
    }
};
