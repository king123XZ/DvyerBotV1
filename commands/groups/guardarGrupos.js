// commands/groups/guardarGrupos.js
let gruposGuardados = []; // Array para guardar los grupos

module.exports = {
    command: ["guardargupos"],
    description: "Guarda todos los grupos donde está el bot y te envía la lista",
    run: async (client, m) => {
        try {
            const chats = await client.fetchChats(); // obtiene todos los chats conocidos del bot
            const grupos = chats.filter(c => c.id.endsWith("@g.us"));

            if(grupos.length === 0){
                return m.reply("❌ No se encontraron grupos donde el bot esté.");
            }

            // Guardar los grupos y obtener nombres
            gruposGuardados = [];
            let listaGrupos = [];

            for(let i=0;i<grupos.length;i++){
                const grupoId = grupos[i].id;
                try {
                    // Obtener metadata del grupo para tener el nombre correcto
                    const metadata = await client.groupMetadata(grupoId);
                    const nombre = metadata.subject || "Grupo sin nombre";
                    gruposGuardados.push({ id: grupoId, name: nombre });
                    listaGrupos.push(`${i+1}. ${nombre}`);
                } catch(err){
                    // Si falla metadata, guardar solo el id
                    gruposGuardados.push({ id: grupoId, name: grupoId });
                    listaGrupos.push(`${i+1}. ${grupoId}`);
                }
            }

            m.reply(`✅ Se guardaron ${gruposGuardados.length} grupos:\n\n${listaGrupos.join("\n")}`);
            console.log("Grupos guardados:", gruposGuardados);

        } catch(err){
            console.log(err);
            m.reply("❌ Ocurrió un error al guardar los grupos.");
        }
    },
    getGrupos: () => gruposGuardados // exportamos función para acceder al array desde otros comandos
};
