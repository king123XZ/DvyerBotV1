const fs = require("fs");
const path = "./groups.json";

module.exports = {
    command: ["listagrupos"],
    description: "Muestra todos los grupos guardados donde está el bot",
    
    run: async (client, m) => {
        try {
            if(!fs.existsSync(path)) return m.reply("❌ No hay grupos guardados aún.");

            const gruposGuardados = JSON.parse(fs.readFileSync(path));

            if(gruposGuardados.length === 0){
                return m.reply("❌ No hay grupos guardados aún.");
            }

            const listaGrupos = gruposGuardados
                .map((g, i) => `${i+1}. ${g.name}`)
                .join("\n");

            m.reply(`📋 Lista de grupos guardados (${gruposGuardados.length}):\n\n${listaGrupos}`);
        } catch(err){
            console.log(err);
            m.reply("❌ Error al leer los grupos guardados.");
        }
    }
};
