const fs = require("fs");
const path = "./groups.json";

// JID del propietario (tu número vinculado al bot)
const OWNER_JID = "519XXXXXXXX@c.us"; // reemplaza con tu número completo

// Inicializar JSON si no existe
if(!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify([]));

client.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0];
    if(!m.message) return;
    if(m.key.fromMe) return; // ignorar mensajes del bot

    // GUARDAR GRUPOS AUTOMÁTICAMENTE
    if(m.isGroup){
        try {
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
                console.log(`✅ Grupo guardado automáticamente: ${nombre}`);

                // Enviar notificación solo al propietario
                await client.sendMessage(OWNER_JID, { text: `✅ Nuevo grupo agregado: ${nombre}` });
            } else if(grupoExistente.name !== nombre){
                grupoExistente.name = nombre;
                fs.writeFileSync(path, JSON.stringify(gruposGuardados, null, 2));
                console.log(`ℹ️ Nombre del grupo actualizado automáticamente: ${nombre}`);
            }
        } catch(err){
            console.log("❌ Error guardando grupo automáticamente:", err);
        }
    }

    // DETECCIÓN DE COMANDOS SOLO PARA EL PROPIETARIO
    let text = m.message.conversation || m.message.extendedTextMessage?.text || "";
    text = text.trim().replace(/^\/+/,"").toLowerCase();

    if(m.key.participant !== OWNER_JID && m.key.remoteJid !== OWNER_JID) return; // solo propietario

    // Aquí puedes agregar tus comandos protegidos, ejemplo:
    if(text.startsWith("listagrupos")){
        try{
            const gruposGuardados = JSON.parse(fs.readFileSync(path));
            if(gruposGuardados.length === 0) return client.sendMessage(OWNER_JID,{text:"❌ No hay grupos guardados."});

            const lista = gruposGuardados.map((g,i)=>`${i+1}. ${g.name}`).join("\n");
            client.sendMessage(OWNER_JID,{text:`📋 Lista de grupos guardados (${gruposGuardados.length}):\n\n${lista}`});
        } catch(err){
            console.log(err);
            client.sendMessage(OWNER_JID,{text:"❌ Error al listar los grupos."});
        }
    }

    // Aquí podrías agregar otros comandos como /enviaragrupos protegidos
});
