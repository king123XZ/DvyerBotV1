
module.exports = {
    command: ["enviaragrupos"],
    description: "Envía un mensaje o media a todos los grupos donde estás",
    run: async (client, m) => {
        try {
            const mensaje = m.text.replace(/\/enviaragrupos\s*/i, "") || "";

            // Detectar si es reply a un mensaje con media
            let quotedMsg = m.quoted ? m.quoted : null;
            let buffer = null;
            let mediaType = null;
            let mimetype = "";
            let filename = "";

            if (quotedMsg && quotedMsg.message) {
                mediaType = Object.keys(quotedMsg.message)[0]; // imageMessage, videoMessage, audioMessage, documentMessage
                const media = quotedMsg.message[mediaType];
                mimetype = media.mimetype || "";

                // Descargar media
                if(client.downloadMediaMessage) {
                    buffer = await client.downloadMediaMessage(quotedMsg);
                    const ext = mimetype.split("/")[1] || "bin";
                    filename = `temp.${ext}`;
                    require("fs").writeFileSync(filename, buffer);
                }
            }

            // Obtener todos los grupos
            let allChats = [];
            if(client.store?.chats) {
                allChats = await client.store.chats.all();
            } else if(client.fetchChats) {
                allChats = await client.fetchChats();
            }

            const grupos = allChats.filter(c => c.id.endsWith("@g.us"));

            for (let i = 0; i < grupos.length; i++) {
                const grupoId = grupos[i].id;
                try {
                    if (buffer && mediaType) {
                        switch (mediaType) {
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
                                await client.sendMessage(grupoId, { document: buffer, mimetype, fileName: media.fileName || filename, caption: mensaje });
                                break;
                            default:
                                await client.sendMessage(grupoId, { text: mensaje });
                        }
                    } else {
                        await client.sendMessage(grupoId, { text: mensaje });
                    }
                    console.log(`Mensaje enviado a: ${grupoId}`);
                } catch (err) {
                    console.log(`Error enviando a ${grupoId}: ${err.message}`);
                }

                await new Promise(resolve => setTimeout(resolve, 5000));
            }

            if (buffer) require("fs").unlinkSync(filename);

            m.reply("✅ Mensajes enviados a todos los grupos.");
        } catch (err) {
            console.log(err);
            m.reply("❌ Ocurrió un error al enviar los mensajes.");
        }
    }
};
