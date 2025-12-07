const fs = require("fs");
const path = "./groups.json";

module.exports = {
    command: ["enviaragrupos"],
    description: "Reenvía mensaje o media a todos los grupos guardados de forma segura",
    run: async (client, m) => {
        const sender = (m.key.participant || m.key.remoteJid).replace("@s.whatsapp.net","");
        if(!global.owner.includes(sender)) return m.reply("❌ Solo el propietario puede usar este comando.");

        if(!fs.existsSync(path)) return m.reply("❌ No hay grupos guardados.");
        const gruposGuardados = JSON.parse(fs.readFileSync(path)).filter(g => g.id.endsWith("@g.us"));
        if(gruposGuardados.length === 0) return m.reply("❌ No hay grupos guardados.");

        const retraso = 10000; // 10 segundos
        const gruposExcluidos = [
            "51917391317@s.whatsapp.net", // tu número personal
            "120363401477412280@g.us"    // grupo de soporte u otros
        ];

        // Detectar si es mensaje citado o mensaje directo
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const contenido = quoted || m.message;

        // Obtener texto correctamente
        const mensajeTexto = 
            contenido.conversation || 
            contenido[Object.keys(contenido).find(k => k.endsWith("Message"))]?.caption || 
            contenido.extendedTextMessage?.text || 
            "";

        // Detectar media
        let buffer = null, mediaType = null, mimetype = "", filename = "";
        const tiposMedia = ["imageMessage","videoMessage","audioMessage","documentMessage"];
        for (let tipo of tiposMedia){
            if (contenido[tipo]) {
                mediaType = tipo;
                mimetype = contenido[tipo].mimetype || "";
                try {
                    buffer = await client.downloadMediaMessage({ message: contenido });
                    const ext = mimetype.split("/")[1] || "bin";
                    filename = `temp.${ext}`;
                    fs.writeFileSync(filename, buffer);
                } catch(err){
                    console.log("⚠️ No se pudo descargar la media, se enviará solo texto.", err.message);
                    buffer = null;
                    mediaType = null;
                }
                break;
            }
        }

        // Revisar grupos antes de enviar
        let gruposPrivados = [];
        let gruposAEnviar = [];

        for(const grupo of gruposGuardados){
            const grupoId = grupo.id;
            if(gruposExcluidos.includes(grupoId)) continue;

            try{
                const metadata = await client.groupMetadata(grupoId);
                const soyAdmin = metadata.participants.find(p => p.id === sender)?.admin || false;

                if(metadata.restrict && !soyAdmin){
                    gruposPrivados.push(metadata.subject);
                } else {
                    gruposAEnviar.push(grupoId);
                }
            } catch(err){
                console.log(`Error obteniendo metadata de ${grupoId}: ${err.message}`);
            }
        }

        // Notificar grupos privados
        if(gruposPrivados.length > 0){
            await m.reply(`⚠️ No se enviará mensaje a los siguientes grupos (solo admins pueden escribir y no eres admin):\n- ${gruposPrivados.join("\n- ")}`);
        }

        const totalGrupos = gruposAEnviar.length;
        const tiempoEstimado = Math.ceil((totalGrupos * retraso) / 1000);
        await m.reply(`⌛ Se enviará el mensaje a ${totalGrupos} grupos.\n⏱ Tiempo estimado: ${tiempoEstimado} segundos.`);

        // Enviar mensaje/media
        for(let i=0;i<gruposAEnviar.length;i++){
            const grupoId = gruposAEnviar[i];
            try {
                const enviar = async () => {
                    if(buffer && mediaType){
                        switch(mediaType){
                            case "imageMessage": await client.sendMessage(grupoId,{image:buffer,caption:mensajeTexto}); break;
                            case "videoMessage": await client.sendMessage(grupoId,{video:buffer,caption:mensajeTexto}); break;
                            case "audioMessage": await client.sendMessage(grupoId,{audio:buffer,mimetype}); break;
                            case "documentMessage": await client.sendMessage(grupoId,{document:buffer,mimetype,fileName:contenido[mediaType]?.fileName||filename,caption:mensajeTexto}); break;
                            default: await client.sendMessage(grupoId,{text:mensajeTexto});
                        }
                    } else if(mensajeTexto){
                        await client.sendMessage(grupoId,{text:mensajeTexto});
                    } else {
                        console.log(`⚠️ No hay contenido válido para enviar en ${grupoId}`);
                    }
                };

                try {
                    await enviar();
                } catch(err){
                    if(err.status === 429){
                        console.log(`⚠️ Rate limit alcanzado, esperando 60s antes de continuar...`);
                        await new Promise(r => setTimeout(r, 60000));
                        i--; // reintentar mismo grupo
                        continue;
                    } else {
                        console.log(`Error enviando a ${grupoId}: ${err.message}`);
                    }
                }

                await new Promise(r=>setTimeout(r,retraso));

            } catch(err){
                console.log(`Error procesando grupo ${grupoId}: ${err.message}`);
            }
        }

        if(buffer) fs.unlinkSync(filename);
        m.reply("✅ Mensaje reenviado de forma segura a todos los grupos disponibles.");
    }
};
