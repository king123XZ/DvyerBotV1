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
                mediaType = Object.keys(quotedMsg.message)[0];
                const media = quotedMsg.message[mediaType];
                mimetype = media.mimetype || "";

                if(client.downloadMediaMessage) {
                    buffer = await client.downloadMediaMessage(quotedMsg);
                    const ext = mimetype.split("/")[1] || "bin";
                    filename = `temp.${ext}`;
                    require("fs").writeFileSync(filename, buffer);
                }
            }

            // Obtener chats recientes del bot y filtrar solo grupos
            const chats = client.chats?.all ? await client.chats.all() : [];
            const grupos = chats.filter(c => c.id.endsWith("@g.us"));

            if(grupos.length === 0){
                return m.reply("❌ No se encontraron grupos donde el bot esté.");
            }

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
                                await client.sendMessage(grupoId, { document: buffer, mimetype, fileName: quotedMsg.message[mediaType].fileName || filename, caption: mensaje });
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

                await new Promise(resolve => setTimeout(resolve, 5000)); // retraso
            }

            if (buffer) require("fs").unlinkSync(filename);
            m.reply("✅ Mensajes enviados a todos los grupos.");
        } catch (err) {
            console.log(err);
            m.reply("❌ Ocurrió un error al enviar los mensajes.");
        }
    }
};

