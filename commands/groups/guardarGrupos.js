// commands/groups/guardarGrupos.js
let gruposGuardados = []; // Array para guardar los grupos

module.exports = {
    command: ["guardargupos"],
    description: "Guarda todos los grupos donde está el bot y te envía la lista",
    run: async (client, m) => {
        try {
            // Obtener todos los chats del cliente
            const chats = await client.fetchChats(); // obtiene todos los chats activos

            // Filtrar solo grupos
            gruposGuardados = chats
                .filter(c => c.id.endsWith("@g.us"))
                .map(c => ({ id: c.id, name: c.name || "Grupo sin nombre" }));

            if(gruposGuardados.length === 0){
                return m.reply("❌ No se encontraron grupos donde el bot esté.");
            }

            // Crear lista de nombres de grupos
            const listaGrupos = gruposGuardados.map((g, i) => `${i+1}. ${g.name}`).join("\n");

            m.reply(`✅ Se guardaron ${gruposGuardados.length} grupos correctamente:\n\n${listaGrupos}`);
            console.log("Grupos guardados:", gruposGuardados);
        } catch(err){
            console.log(err);
            m.reply("❌ Ocurrió un error al guardar los grupos.");
        }
    },
    getGrupos: () => gruposGuardados // exportamos función para acceder al array desde otros comandos
};
