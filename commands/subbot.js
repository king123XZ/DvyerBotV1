const { startSubBot } = require('../lib/subBotManager'); 

module.exports = {
    name: 'subbot',
    isOwner: true, // Tu main ya protege esto
    run: async (client, m, args) => {
        const userNumber = args[0];
        
        if (!userNumber) return m.reply("❌ Uso: .subbot 51900000000");

        await client.sendMessage(m.chat, { text: "⏳ Iniciando sub-bot... Espera el código de vinculación." }, { quoted: m });

        try {
            await startSubBot(client, m, userNumber);
        } catch (e) {
            console.error(e);
            m.reply("❌ Error al iniciar el sub-bot.");
        }
    }
};
