const fs = require("fs");
const pathMensajes = "./data/mensajes.json";

// Crear carpeta y JSON si no existen
if(!fs.existsSync("./data")) fs.mkdirSync("./data");
if(!fs.existsSync(pathMensajes)) fs.writeFileSync(pathMensajes,"[]");

let estadoEnvio = {};

module.exports = {
    command: ["mediafire","mf","guardarmedia","guardartexto","cancelar"],
    description: "Guardar media + texto en JSON",
    run: async (client, m) => {
        const sender = (m.key.participant || m.key.remoteJid).replace("@s.whatsapp.net","");
        if(!global.owner.includes(sender)) return m.reply("❌ Solo el propietario puede usar este comando.");

        const text = m.text || m.message?.conversation || "";
        const comando = text.split(" ")[0].replace("/","").toLowerCase();

        if(!estadoEnvio[sender]) estadoEnvio[sender] = { paso: 0, media: null, mediaType: null, fileName: "", caption: "" };
        const estado = estadoEnvio[sender];

        // ---------------------
        // Iniciar flujo
        // ---------------------
        if(comando === "mediafire" || comando === "mf"){
            estadoEnvio[sender] = { paso: 0, media: null, mediaType: null, fileName: "", caption: "" };
            return m.reply("✅ Flujo iniciado. Responde al mensaje que contiene media y escribe `/guardarmedia` para guardarlo.");
        }

        // ---------------------
        // Guardar media
        // ---------------------
        if(comando === "guardarmedia"){
            // Verificar si respondió a un mensaje
            if(!m.message.extendedTextMessage || !m.message.extendedTextMessage.contextInfo?.quotedMessage)
                return m.reply("❌ Debes responder al mensaje que contiene la media.");

            const quoted = m.message.extendedTextMessage.contextInfo.quotedMessage;
            const tiposMedia = ["imageMessage","videoMessage","documentMessage","audioMessage","stickerMessage","animatedStickerMessage"];
            let mediaEncontrada = false;

            for(let tipo of tiposMedia){
                if(quoted[tipo]){
                    const mediaMessage = quoted[tipo];
                    estado.mediaType = tipo.replace("Message","").toLowerCase();
                    estado.caption = mediaMessage.caption || "";
                    estado.fileName = `data/${Date.now()}.${estado.mediaType === "video" ? "mp4" : estado.mediaType === "audio" ? "mp3" : "jpg"}`;

                    try{
                        const buffer = await client.downloadMediaMessage({ message: { [tipo]: mediaMessage } });
                        fs.writeFileSync(estado.fileName, buffer);
                        estado.media = estado.fileName;
                        mediaEncontrada = true;
                        estado.paso = 1;
                        return m.reply(`✅ Media guardada temporalmente (${estado.mediaType}). Ahora envía el texto que acompañará la media y luego escribe /guardartexto.`);
                    } catch(err){
                        console.log(err);
                        return m.reply("❌ No se pudo descargar la media. Intenta de nuevo.");
                    }
                }
            }

            if(!mediaEncontrada) return m.reply("❌ La media del mensaje no es válida.");
        }

        // ---------------------
        // Guardar texto
        // ---------------------
        if(comando === "guardartexto"){
            if(estado.paso !== 1) return m.reply("❌ Primero debes guardar la media usando /guardarmedia.");
            if(!text) return m.reply("❌ Envía el texto antes de usar /guardartexto.");

            estado.caption = text;
            const mensajes = JSON.parse(fs.readFileSync(pathMensajes));
            mensajes.push({
                id: Date.now(),
                tipo: estado.mediaType,
                texto: estado.caption,
                media: estado.media
            });
            fs.writeFileSync(pathMensajes, JSON.stringify(mensajes, null, 2));
            estadoEnvio[sender] = null;
            return m.reply("✅ Mensaje completo guardado en data/mensajes.json.");
        }

        // ---------------------
        // Cancelar flujo
        // ---------------------
        if(comando === "cancelar"){
            estadoEnvio[sender] = null;
            return m.reply("❌ Flujo cancelado. Todo lo temporal fue eliminado.");
        }
    }
};
