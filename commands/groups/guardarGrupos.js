module.exports = {
    command: ["registrargrupos"],
    description: "Envía un comando a todos los grupos para que se registren automáticamente",
    run: async (client, m) => {
        const sender = (m.key.participant || m.key.remoteJid).replace("@s.whatsapp.net","");
        if(!global.owner.includes(sender)) return m.reply("❌ Solo el propietario puede usar este comando.");

        // En Baileys v5, client.store.chats es un Map
        const chats = Array.from(client.store.chats.values()).filter(c => c.id.endsWith("@g.us"));

        for(const chat of chats){
            await client.sendMessage(chat.id, { text: "!registrarme" });
            await new Promise(r => setTimeout(r, 1000)); // retraso 1s para no saturar
        }

        m.reply(`✅ Se envió el comando a ${chats.length} grupos para registrarlos.`);
    }
};
