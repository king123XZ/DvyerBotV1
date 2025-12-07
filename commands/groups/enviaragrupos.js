const fs = require("fs");
const path = "./groups.json";

module.exports = {
    command: ["enviaragrupos"],
    description: "Reenvía mensaje o media a todos los grupos guardados con tiempo estimado",
    run: async (client, m) => {
        // Solo el propietario vinculado puede usar el comando
        const sender = (m.key.participant || m.key.remoteJid).replace("@s.whatsapp.net","");
        if(!global.owner.includes(sender)) return m.reply("❌ Solo el propietario puede usar este comando.");

        if(!fs.existsSync(path)) return m.reply("❌ No hay grupos guardados.");
        const gruposGuardados = JSON.parse(fs.readFileSync(path)).filter(g => !g.id.endsWith("@s.whatsapp.net")); // eliminar cualquier número personal
        if(gruposGuardados.length === 0) return m.reply("❌ No hay grupos guardados.");

        const totalGrupos = gruposGuardados.length;
        const retraso = 5000; // 5 segundos
        const tiempoEstimado = Math.ceil((totalGrupos * retraso) / 1000); // en segundos

        // Notificar al propietario
        await m.reply(`⌛ Se enviará el mensaje a ${totalGrupos} grupos.\n⏱ Tiempo estimado: ${tiempoEstimado} segundos.`);

        // Verificar mensaje o media respondida
        const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage || m.message;
        const mensajeTexto = quoted.conversation || quoted.extendedTextMessage?.text || "";

        // Detectar media
        let buffer = null, mediaType = null, mimetype = "", filename = "";
        const tiposMedia = ["imageMessage","videoMessage","audioMessage","documentMessage"];
        for(let tipo of tiposMedia){
            if(quoted[tipo]){
                mediaType = tipo;
                mimetype = quoted[tipo].mimetype || "";
                buffer = await client.downloadMediaMessage({ message: quoted });
                const ext = mimetype.split("/")[1] || "bin";
                filename = `temp.${ext}`;
                fs.writeFileSync(filename, buffer);
                break;
            }
        }

        // Grupos o números a excluir
        const gruposExcluidos = [
            "51917391317@s.whatsapp.net", // tu número personal
            "120363401477412280@g.us"    // grupo de soporte u otros
        ];

        // Enviar mensajes
        for(let i=0;i<gruposGuardados.length;i++){
            const grupoId = gruposGuardados[i].id;
            if(gruposExcluidos.includes(grupoId)) continue;

            try{
                const metadata = await client.groupMetadata(grupoId);
                if(metadata.restrict){ // grupo cerrado
                    console.log(`⚠️ Grupo cerrado: ${metadata.subject}`);
                    continue;
                }

                // Enviar mensaje o media
                if(buffer && mediaType){
                    switch(mediaType){
                        case "imageMessage": await client.sendMessage(grupoId,{image:buffer,caption:mensajeTexto}); break;
                        case "videoMessage": await client.sendMessage(grupoId,{video:buffer,caption:mensajeTexto}); break;
                        case "audioMessage": await client.sendMessage(grupoId,{audio:buffer,mimetype}); break;
                        case "documentMessage": await client.sendMessage(grupoId,{document:buffer,mimetype,fileName:quoted[mediaType].fileName||filename,caption:mensajeTexto}); break;
                        default: await client.sendMessage(grupoId,{text:mensajeTexto});
                    }
                } else {
                    await client.sendMessage(grupoId,{text:mensajeTexto});
                }

            } catch(err){ 
                console.log(`Error enviando a ${grupoId}: ${err.message}`); 
            }

            // Retraso seguro entre envíos
            await new Promise(r=>setTimeout(r,retraso));
        }

        // Borrar archivo temporal
        if(buffer) fs.unlinkSync(filename);

        m.reply("✅ Mensaje reenviado de forma segura a todos los grupos.");
    }
};

