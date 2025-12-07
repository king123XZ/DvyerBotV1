const fs = require("fs");
const path = "./groups.json";

module.exports = {
    command: ["enviaragrupos"],
    description: "Enviar texto y media a todos los grupos guardados",
    run: async (client, m) => {
        const sender = (m.key.participant || m.key.remoteJid).replace("@s.whatsapp.net","");
        if(!global.owner.includes(sender)) return m.reply("❌ Solo el propietario puede usar este comando.");

        if(!fs.existsSync(path)) return m.reply("❌ No hay grupos guardados.");
        const gruposGuardados = JSON.parse(fs.readFileSync(path)).filter(g => g.id.endsWith("@g.us"));
        if(gruposGuardados.length === 0) return m.reply("❌ No hay grupos guardados.");

        const retraso = 10000; // 10 segundos entre cada grupo

        // Detectar mensaje citado o directo
        const quoted = m.quoted ? m.quoted : null;
        const contenido = quoted || m;

        // Detectar media y texto
        let tipoMedia = null;
        let buffer = null;
        let caption = contenido.text || contenido.message?.conversation || "";

        if(contenido.message?.imageMessage){
            tipoMedia = "image";
            buffer = await client.downloadMediaMessage({ message: contenido.message });
            caption = contenido.message.imageMessage.caption || caption;
        } else if(contenido.message?.videoMessage){
            tipoMedia = "video";
            buffer = await client.downloadMediaMessage({ message: contenido.message });
            caption = contenido.message.videoMessage.caption || caption;
        } else if(contenido.message?.documentMessage){
            tipoMedia = "document";
            buffer = await client.downloadMediaMessage({ message: contenido.message });
            caption = contenido.message.documentMessage.caption || caption;
        }

        // Filtrar grupos excluidos o privados
        const gruposAEnviar = [];
        const gruposPrivados = [];
        for(const grupo of gruposGuardados){
            const grupoId = grupo.id;
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
            await m.reply(`⚠️ No se enviará mensaje a los siguientes grupos (solo admins pueden escribir):\n- ${gruposPrivados.join("\n- ")}`);
        }

        await m.reply(`⌛ Se enviará el mensaje a ${gruposAEnviar.length} grupos.`);

        // Enviar mensaje/media
        for(const grupoId of gruposAEnviar){
            try{
                if(buffer && tipoMedia){
                    switch(tipoMedia){
                        case "image":
                            await client.sendMessage(grupoId,{image:buffer,caption});
                            break;
                        case "video":
                            await client.sendMessage(grupoId,{video:buffer,caption});
                            break;
                        case "document":
                            await client.sendMessage(grupoId,{document:buffer,caption});
                            break;
                        default:
                            await client.sendMessage(grupoId,{text:caption});
                    }
                } else {
                    await client.sendMessage(grupoId,{text:caption});
                }
                await new Promise(r => setTimeout(r,retraso));
            } catch(err){
                console.log(`Error enviando a ${grupoId}: ${err.message}`);
            }
        }

        m.reply("✅ Mensaje reenviado correctamente a todos los grupos.");
    }
};
