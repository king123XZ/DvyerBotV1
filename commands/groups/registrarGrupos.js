// commands/owner/registrarGrupos.js
module.exports = {
    command: ["registrargrupos"],
    description: "Envía un comando a todos los grupos para que se registren automáticamente",
    run: async (client, m) => {
        if(m.key.participant !== OWNER_JID && m.key.remoteJid !== OWNER_JID){
            return m.reply("❌ Solo el propietario puede usar este comando.");
        }

        // Obtener todos los chats del cliente
        const chats = Array.from(client.store.chats.values()).filter(c => c.id.endsWith("@g.us"));

        for(const chat of chats){
            await client.sendMessage(chat.id, { text: "!registrarme" });
            await new Promise(r => setTimeout(r, 1000)); // retraso 1s
        }

        m.reply(`✅ Se envió el comando a ${chats.length} grupos para registrarlos.`);
    }
};
