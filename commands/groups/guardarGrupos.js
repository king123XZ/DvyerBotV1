// commands/groups/guardarGrupos.js
const fs = require("fs");
const path = "./groups.json";

// Inicializar JSON
if(!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify([]));

module.exports = {
    command: ["!registrarme"], // comando interno automático
    run: async (client, m) => {
        if(!m.isGroup) return;

        let gruposGuardados = JSON.parse(fs.readFileSync(path));
        const grupoId = m.key.remoteJid;

        // Verificar duplicado
        if(!gruposGuardados.find(g => g.id === grupoId)){
            let nombre = grupoId;
            try{
                const metadata = await client.groupMetadata(grupoId);
                nombre = metadata.subject || grupoId;
            }catch{}

            gruposGuardados.push({ id: grupoId, name: nombre });
            fs.writeFileSync(path, JSON.stringify(gruposGuardados, null, 2));

            // Notificación solo al propietario
            await client.sendMessage(OWNER_JID, { text: `✅ Nuevo grupo registrado: ${nombre}` });
        }
    }
};
