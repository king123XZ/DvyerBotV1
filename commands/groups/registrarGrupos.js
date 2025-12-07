const fs = require("fs");
const path = "./groups.json";

module.exports = {
    command: ["registrargrupos"],
    description: "Envía un comando a todos los grupos para que se registren automáticamente",
    
    run: async (client, m) => {
        const OWNER_JID = "519XXXXXXXX@c.us"; // tu número privado
        if(m.key.participant !== OWNER_JID && m.key.remoteJid !== OWNER_JID){
            return m.reply("❌ Solo el propietario puede usar este comando.");
        }

        // Leer grupos conocidos (puedes usar un JSON o la lista de chats)
        let grupos = [];
        try {
            // Si ya tienes un JSON de grupos conocidos, lo lees
            if(fs.existsSync(path)) grupos = JSON.parse(fs.readFileSync(path));
        } catch{}

        // Si no hay grupos guardados, enviar el comando a todos los chats conocidos
        // Aquí asumimos que tienes una lista de chats en client.chats o algún arreglo
        const chats = Array.from(client.store.chats.values()).filter(c => c.id.endsWith("@g.us"));
        
        for(const chat of chats){
            // Enviar un mensaje especial que el bot reconocerá y registrará el grupo
            await client.sendMessage(chat.id, { text: "!registrarme" });
            await new Promise(r => setTimeout(r, 1000)); // retraso 1s para no saturar
        }

        m.reply(`✅ Se envió el comando a ${chats.length} grupos para registrarlos.`);
    }
};
