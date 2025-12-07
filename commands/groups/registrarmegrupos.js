// commands/groups/guardarGrupos.js
const fs = require("fs");
const path = "./groups.json";

// Inicializar JSON
if(!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify([]));

module.exports = {
    command: ["!registrarme"],
    run: async (client, m) => {
        if(!m.isGroup) return;

        let gruposGuardados = JSON.parse(fs.readFileSync(path));
        const grupoId = m.key.remoteJid;

        if(!gruposGuardados.find(g => g.id === grupoId)){
            let nombre = grupoId;
            try{
                const metadata = await client.groupMetadata(grupoId);
                nombre = metadata.subject || grupoId;
            }catch{}

            gruposGuardados.push({ id: grupoId, name: nombre });
            fs.writeFileSync(path, JSON.stringify(gruposGuardados, null, 2));

            // Notificación solo a los propietarios
            for(const owner of global.owner){
                await client.sendMessage(`${owner}@c.us`, { text: `✅ Nuevo grupo registrado: ${nombre}` });
            }
        }
    }
};

