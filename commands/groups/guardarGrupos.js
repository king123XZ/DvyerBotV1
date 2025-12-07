// commands/groups/guardarGrupos.js
let gruposGuardados = []; // Array global para guardar grupos

module.exports = {
    command: ["guardargupos"],
    description: "Guarda todos los grupos donde está el bot y te envía la lista",
    run: async (client, m) => {
        try {
            // Revisar los mensajes recientes del evento
            const chats = []; // array temporal
            if(client.ev && client.ev.chats){
                client.ev.chats.forEach(c => chats.push(c));
            }

            // Si no hay chats, usar solo los grupos que ya se han recibido
            if(chats.length === 0 && m.isGroup){
                chats.push(m);
            }

            // Filtrar solo grupos (@g.us)
            const grupos = chats.filter(c => c.id?.endsWith("@g.us") || m.isGroup);

            if(grupos.length === 0) return m.reply("❌ No se encontraron grupos donde el bot esté.");

            gruposGuardados = [];
            let listaGrupos = [];

            for(let i=0;i<grupos.length;i++){
                const grupoId = grupos[i].id || m.key.remoteJid;
                try{
                    const metadata = await client.groupMetadata(grupoId);
                    const nombre = metadata.subject || "Grupo sin nombre";
                    if(!gruposGuardados.find(g => g.id === grupoId)){
                        gruposGuardados.push({ id: grupoId, name: nombre });
                        listaGrupos.push(`${i+1}. ${nombre}`);
                    }
                }catch(err){
                    if(!gruposGuardados.find(g => g.id === grupoId)){
                        gruposGuardados.push({ id: grupoId, name: grupoId });
                        listaGrupos.push(`${i+1}. ${grupoId}`);
                    }
                }
            }

            m.reply(`✅ Se guardaron ${gruposGuardados.length} grupos:\n\n${listaGrupos.join("\n")}`);
        } catch(err){
            console.log(err);
            m.reply("❌ Ocurrió un error al guardar los grupos.");
        }
    },
    getGrupos: () => gruposGuardados
};
