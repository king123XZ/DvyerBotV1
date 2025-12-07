let gruposGuardados = [];

module.exports = {
    command: ["guardargupos"],
    description: "Guarda todos los grupos donde está el bot y muestra la lista",
    run: async (client, m) => {
        try {
            // Obtener chats del store del cliente
            const chats = Array.from(client.store.chats.values());
            const grupos = chats.filter(c => c.id.endsWith("@g.us"));

            if(grupos.length === 0) return m.reply("❌ No se encontraron grupos donde el bot esté.");

            gruposGuardados = [];
            let listaGrupos = [];

            for(let i=0;i<grupos.length;i++){
                const grupoId = grupos[i].id;
                try{
                    const metadata = await client.groupMetadata(grupoId);
                    const nombre = metadata.subject || "Grupo sin nombre";
                    gruposGuardados.push({ id: grupoId, name: nombre });
                    listaGrupos.push(`${i+1}. ${nombre}`);
                }catch(err){
                    gruposGuardados.push({ id: grupoId, name: grupoId });
                    listaGrupos.push(`${i+1}. ${grupoId}`);
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
