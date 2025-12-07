// Array dinámico para guardar grupos donde está el bot
let gruposGuardados = [];

module.exports = {
    command: ["enviaragrupos"],
    description: "Envía texto o media a todos los grupos donde está el bot",
    run: async (client, m) => {
        try {
            // Detectar mensaje de texto del comando
            const mensaje = m.text.replace(/\/enviaragrupos\s*/i, "") || "";

            // Detectar si hay media en el mensaje
            let buffer = null;
            let mediaType = null;
            let mimetype = "";
            let filename = "";

            // Verificar los tipos de media soportados
            const tiposMedia = ["imageMessage","videoMessage","audioMessage","documentMessage"];

            for (let tipo of tiposMedia){
                if(m.message[tipo]){
                    mediaType = tipo;
                    const media = m.message[tipo];
                    mimetype = media.mimetype || "";
                    buffer = await client.downloadMediaMessage(m);
                    const ext = mimetype.split("/")[1] || "bin";
                    filename = `temp.${ext}`;
                    require("fs").writeFileSync(filename, buffer);
                    break;
                }
            }

            if(gruposGuardados.length === 0) {
                return m.reply("❌ No hay grupos guardados donde enviar mensajes.");
            }

            // Enviar a todos los grupos guardados
            for(let i=0; i<gruposGuardados.length; i++){
                const grupoId = gruposGuardados[i];
                try {
                    if(buffer && mediaType){
                        switch(mediaType){
                            case "imageMessage":
                                await client.sendMessage(grupoId, { image: buffer, caption: mensaje });
                                break;
                            case "videoMessage":
                                await client.sendMessage(grupoId, { video: buffer, caption: mensaje });
                                break;
                            case "audioMessage":
                                await client.sendMessage(grupoId, { audio: buffer, mimetype });
                                break;
                            case "documentMessage":
                                await client.sendMessage(grupoId, { document: buffer, mimetype, fileName: m.message[mediaType].fileName || filename, caption: mensaje });
                                break;
                            default:
                                await client.sendMessage(grupoId, { text: mensaje });
                        }
                    } else {
                        await client.sendMessage(grupoId, { text: mensaje });
                    }
                    console.log(`Mensaje enviado a: ${grupoId}`);
                } catch(err){
                    console.log(`Error enviando a ${grupoId}: ${err.message}`);
                }

                await new Promise(resolve => setTimeout(resolve, 5000)); // retraso de 5 segundos
            }

            if(buffer) require("fs").unlinkSync(filename);
            m.reply("✅ Mensajes enviados a todos los grupos.");
        } catch(err){
            console.log(err);
            m.reply("❌ Ocurrió un error al enviar los mensajes.");
        }
    }
};

// -----------------------
// En tu main.js o index.js, para mantener la lista de grupos actualizada
client.ev.on("chats.update", ({ chats }) => {
    chats.forEach(c => {
        if(c.id.endsWith("@g.us") && !gruposGuardados.includes(c.id)){
            gruposGuardados.push(c.id);
        }
    });
});

client.ev.on("group-participants.update", async (update) => {
    const grupoId = update.id;
    if(!gruposGuardados.includes(grupoId)){
        gruposGuardados.push(grupoId);
    }
});
