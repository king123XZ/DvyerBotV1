const fs = require("fs");
const path = "./groups.json";

module.exports = {
    command: ["guardargupos"],
    description: "Guarda todos los grupos donde está el bot y muestra la lista",
    run: async (client, m) => {
        try {
            // Leer JSON actual
            let gruposGuardados = [];
            if(fs.existsSync(path)){
                gruposGuardados = JSON.parse(fs.readFileSync(path));
            }

            // Solo si es mensaje de grupo
            if(!m.isGroup) return m.reply("❌ Este comando solo funciona en grupos.");

            const grupoId = m.key.remoteJid;

            // Revisar si ya está guardado
            if(!gruposGuardados.find(g => g.id === grupoId)){
                try {
                    const metadata = await client.groupMetadata(grupoId);
                    gruposGuardados.push({ id: grupoId, name: metadata.subject || "Grupo sin nombre" });
                } catch {
                    gruposGuardados.push({ id: grupoId, name: grupoId });
                }

                fs.writeFileSync(path, JSON.stringify(gruposGuardados, null, 2));
            }

            // Mostrar lista de grupos
            const listaGrupos = gruposGuardados.map((g,i) => `${i+1}. ${g.name}`).join("\n");
            m.reply(`✅ Grupos guardados (${gruposGuardados.length}):\n\n${listaGrupos}`);

        } catch(err){
            console.log(err);
            m.reply("❌ Ocurrió un error al guardar los grupos.");
        }
    },
    getGrupos: () => {
        if(fs.existsSync(path)) return JSON.parse(fs.readFileSync(path));
        return [];
    }
};
