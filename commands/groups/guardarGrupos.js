const fs = require("fs");
const path = "./groups.json";

// Inicializar JSON si no existe
if(!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify([]));

module.exports = {
    command: ["guardargupos"],
    description: "Guarda automáticamente grupos donde el bot recibe mensajes",
    
    run: async (client, m) => {
        try {
            if(!m.isGroup) return; // Solo grupos

            let gruposGuardados = JSON.parse(fs.readFileSync(path));
            const grupoId = m.key.remoteJid;

            // Verificar si ya existe
            let grupoExistente = gruposGuardados.find(g => g.id === grupoId);

            // Obtener nombre del grupo
            let nombre = grupoExistente?.name || grupoId;
            try{
                const metadata = await client.groupMetadata(grupoId);
                nombre = metadata.subject || nombre;
            }catch{}

            if(!grupoExistente){
                gruposGuardados.push({ id: grupoId, name: nombre });
                fs.writeFileSync(path, JSON.stringify(gruposGuardados, null, 2));
                m.reply(`✅ Grupo guardado: ${nombre}`);
            }else{
                // Actualizar nombre si cambió
                if(grupoExistente.name !== nombre){
                    grupoExistente.name = nombre;
                    fs.writeFileSync(path, JSON.stringify(gruposGuardados, null, 2));
                    m.reply(`ℹ️ Nombre del grupo actualizado: ${nombre}`);
                }
            }

        } catch(err){
            console.log(err);
            m.reply("❌ Error al guardar el grupo.");
        }
    },

    // Función para obtener los grupos desde otros comandos
    getGrupos: () => {
        if(!fs.existsSync(path)) return [];
        return JSON.parse(fs.readFileSync(path));
    }
};
