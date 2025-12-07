const fs = require("fs");
const pathMensajes = "./mensajes.json";

// Crear JSON si no existe
if(!fs.existsSync(pathMensajes)) fs.writeFileSync(pathMensajes,"[]");

// Estado temporal por usuario
let estadoEnvio = {};

module.exports = {
    command: ["guardarmensaje","guardarMedia","guardarTexto","cancelar"],
    description: "Flujo completo para guardar media + texto en JSON",
    run: async (client, m) => {
        const sender = (m.key.participant || m.key.remoteJid).replace("@s.whatsapp.net","");
        if(!global.owner.includes(sender)) return m.reply("❌ Solo el propietario puede usar este comando.");

        const comando = m.text.split(" ")[0].toLowerCase();

        if(!estadoEnvio[sender]) estadoEnvio[sender] = { paso: 0, media: null, mediaType: null, fileName: "", caption: "" };
        const estado = estadoEnvio[sender];

        // ---------------------
        // Comando iniciar flujo
        // ---------------------
        if(comando === "/guardarmensaje"){
            estadoEnvio[sender] = { paso: 0, media: null, mediaType: null, fileName: "", caption: "" };
            return m.reply("✅ Flujo iniciado. Envía la media (imagen, video, audio, documento o sticker) y luego escribe `/guardarMedia` para guardarla.");
        }

        // ---------------------
        // Comando guardar media
        // ---------------------
        if(comando === "/guardarmedia"){
            if(!m.message) return m.reply("❌ Envía primero una media antes de usar este comando.");

            const tiposMedia = ["imageMessage","videoMessage","documentMessage","audioMessage","stickerMessage","animatedStickerMessage"];
            let mediaEncontrada = false;

            for(let tipo of tiposMedia){
                if(m.message[tipo]){
                    estado.mediaType = tipo.replace("Message","").toLowerCase();
                    estado.caption = m.message[tipo].caption || "";
                    estado.fileName = `data/${Date.now()}.${estado.mediaType === "video" ? "mp4" : estado.mediaType === "audio" ? "mp3" : "jpg"}`;
                    try{
                        const buffer = await client.downloadMediaMessage({ message: m.message });
                        fs.writeFileSync(estado.fileName, buffer);
                        estado.media = estado.fileName;
                        mediaEncontrada = true;
                        estado.paso = 1;
                        return m.reply(`✅ Media guardada temporalmente (${estado.mediaType}). Ahora envía el texto que acompañará la media y luego escribe /guardarTexto.`);
                    } catch(err){
                        return m.reply("❌ No se pudo descargar la media. Intenta de nuevo.");
                    }
                }
            }

            if(!mediaEncontrada) return m.reply("❌ Envía una media válida antes de usar /guardarMedia.");
        }

        // ---------------------
        // Comando guardar texto
        // ---------------------
        if(comando === "/guardartexto"){
            if(estado.paso !== 1) return m.reply("❌ Primero debes guardar la media usando /guardarMedia.");
            if(!m.text) return m.reply("❌ Envía el texto antes de usar /guardarTexto.");

            estado.caption = m.text;

            // Guardar en JSON
            const mensajes = JSON.parse(fs.readFileSync(pathMensajes));
            mensajes.push({
                id: Date.now(),
                tipo: estado.mediaType,
                texto: estado.caption,
                media: estado.media
            });
            fs.writeFileSync(pathMensajes, JSON.stringify(mensajes, null, 2));

            estadoEnvio[sender] = null;
            return m.reply("✅ Mensaje completo guardado en mensajes.json.");
        }

        // ---------------------
        // Comando cancelar
        // ---------------------
        if(comando === "/cancelar"){
            estadoEnvio[sender] = null;
            return m.reply("❌ Flujo cancelado. Todo lo temporal fue eliminado.");
        }
    }
};
