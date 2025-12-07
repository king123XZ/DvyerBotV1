const fs = require("fs");
const pathMensajes = "./mensajes.json";

if(!fs.existsSync(pathMensajes)) fs.writeFileSync(pathMensajes,"[]");

let estadoEnvio = {};

module.exports = {
    command: ["guardarmensaje"],
    description: "Guardar media + texto en JSON para enviar después",
    run: async (client, m) => {
        const sender = (m.key.participant || m.key.remoteJid).replace("@s.whatsapp.net","");
        if(!global.owner.includes(sender)) return m.reply("❌ Solo el propietario puede usar este comando.");

        if(!estadoEnvio[sender]) estadoEnvio[sender] = { paso: 0, media: null, mediaType: null, caption: "", fileName: "" };

        const estado = estadoEnvio[sender];

        // === PASO 0: Recibir media ===
        if(estado.paso === 0){
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
                        break;
                    } catch(err){
                        return m.reply("❌ No se pudo descargar la media.");
                    }
                }
            }

            if(!mediaEncontrada) return m.reply("❌ Envía primero una media (imagen, video, documento, audio o sticker).");

            estado.paso = 1;
            return m.reply("✅ Media guardada temporalmente. Ahora envía el texto que acompañará la media.");
        }

        // === PASO 1: Recibir texto ===
        if(estado.paso === 1){
            estado.caption = m.text || estado.caption;

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
            return m.reply("✅ Mensaje guardado correctamente en el JSON. Podrás enviarlo después a los grupos.");
        }
    }
};
