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

        const retraso = 10000; // 10 segundos para evitar rate limit
        const totalGrupos = gruposGuardados.length;
        const tiempoEstimado = Math.ceil((totalGrupos * retraso) / 1000);

        await m.reply(`⌛ Se enviará el mensaje a ${totalGrupos} grupos.\n⏱ Tiempo estimado: ${tiempoEstimado} segundos.`);

        // Mensaje o media respondida
        const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
        if(!quoted && !m.message.conversation) return m.reply("❌ Debes responder a un mensaje o enviar un texto.");

        const contenido = quoted || m.message;
        const mensajeTexto = contenido.conversation || contenido.extendedTextMessage?.text || "";

        // Detectar media
        let buffer = null, mediaType = null, mimetype = "", filename = "";
        const tiposMedia = ["imageMessage","videoMessage","audioMessage","documentMessage"];
        for(let tipo of tiposMedia){
            if(contenido[tipo]){
                mediaType = tipo;
                mimetype = contenido[tipo].mimetype || "";
                buffer = await client.downloadMediaMessage({ message: contenido });
                const ext = mimetype.split("/")[1] || "bin";
                filename = `temp.${ext}`;
                fs.writeFileSync(filename, buffer);
                break;
            }
        }

        const gruposExcluidos = [
            "51917391317@s.whatsapp.net", // tu número personal
            "120363401477412280@g.us"    // grupo de soporte u otros
        ];

        for(let i=0;i<gruposGuardados.length;i++){
            const grupoId = gruposGuardados[i].id;
            if(gruposExcluidos.includes(grupoId)) continue;

            try {
                const metadata = await client.groupMetadata(grupoId);
                if(metadata.restrict){
                    console.log(`⚠️ Grupo cerrado: ${metadata.subject}`);
                    continue;
                }

                // Enviar mensaje o media
                const enviar = async () => {
                    if(buffer && mediaType){
                        switch(mediaType){
                            case "imageMessage": await client.sendMessage(grupoId,{image:buffer,caption:mensajeTexto}); break;
                            case "videoMessage": await client.sendMessage(grupoId,{video:buffer,caption:mensajeTexto}); break;
                            case "audioMessage": await client.sendMessage(grupoId,{audio:buffer,mimetype}); break;
                            case "documentMessage": await client.sendMessage(grupoId,{document:buffer,mimetype,fileName:contenido[mediaType].fileName||filename,caption:mensajeTexto}); break;
                            default: await client.sendMessage(grupoId,{text:mensajeTexto});
                        }
                    } else {
                        await client.sendMessage(grupoId,{text:mensajeTexto});
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

                await new Promise(r=>setTimeout(r,retraso)); // retraso seguro

            } catch(err){
                console.log(`Error procesando grupo ${grupoId}: ${err.message}`);
            }
        }

        if(buffer) fs.unlinkSync(filename);
        m.reply("✅ Mensaje reenviado de forma segura a todos los grupos.");
    }
};
