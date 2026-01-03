const { startSubBot } = require('../lib/subBotManager'); 

module.exports = {
    name: 'subbot',
    async execute(client, m, args) {
        // 1. Reacción inmediata para confirmar que el bot recibió el comando
        await client.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        const userNumber = args[0];
        if (!userNumber) {
            return client.sendMessage(m.chat, { text: "❌ Escribe el número. Ej: .subbot 51900111222" }, { quoted: m });
        }

        try {
            // 2. Mensaje de confirmación de inicio
            await client.sendMessage(m.chat, { text: "🔄 Iniciando servidor de vinculación... espera el código." }, { quoted: m });
            
            await startSubBot(client, m, userNumber);
        } catch (e) {
            console.error("Error en comando subbot:", e);
            await client.sendMessage(m.chat, { text: `❌ Error interno: ${e.message}` });
        }
    }
};
