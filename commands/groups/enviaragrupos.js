// commands/owner/enviarGrupos.js
const fs = require("fs");
const path = "./groups.json";

module.exports = {
    command: ["enviaragrupos"],
    description: "Envía un mensaje o media a todos los grupos guardados",
    run: async (client, m) => {
        const sender = (m.key.participant || m.key.remoteJid).replace("@s.whatsapp.net","");
        if(!global.owner.includes(sender)) return m.reply("❌ Solo el propietario puede usar este comando.");

        if(!fs.existsSync(path)) return m.reply("❌ No hay grupos guardados.");

        const gruposGuardados = JSON.parse(fs.readFileSync(path));
        if(gruposGuardados.length === 0) return m.reply("❌ No hay grupos guardados.");

        const mensaje = (m.message.conversation || "").replace(/^\/enviaragrupos\s*/i,"") || "";

        let buffer = null, mediaType = null, mimetype = "", filename = "";
        const tiposMedia = ["imageMessage","videoMessage","audioMessage","documentMessage"];
        for(let tipo of tiposMedia){
            if(m.message[tipo]){
                mediaType = tipo;
                mimetype = m.message[tipo].mimetype || "";
                buffer = await client.downloadMediaMessage(m);
                const ext = mimetype.split("/")[1] || "bin";
                filename = `temp.${ext}`;
                require("fs").writeFileSync(filename, buffer);
                break;
            }
        }

        for(let i=0;i<gruposGuardados.length;i++){
            const grupoId = gruposGuardados[i].id;
            try{
                if(buffer && mediaType){
                    switch(mediaType){
                        case "imageMessage": await client.sendMessage(grupoId,{image:buffer,caption:mensaje}); break;
                        case "videoMessage": await client.sendMessage(grupoId,{video:buffer,caption:mensaje}); break;
                        case "audioMessage": await client.sendMessage(grupoId,{audio:buffer,mimetype}); break;
                        case "documentMessage": await client.sendMessage(grupoId,{document:buffer,mimetype,fileName:m.message[mediaType].fileName||filename,caption:mensaje}); break;
                        default: await client.sendMessage(grupoId,{text:mensaje});
                    }
                } else {
                    await client.sendMessage(grupoId,{text:mensaje});
                }
            } catch(err){ console.log(`Error enviando a ${grupoId}: ${err.message}`); }
            await new Promise(r=>setTimeout(r,5000));
        }

        if(buffer) require("fs").unlinkSync(filename);
        m.reply("✅ Mensajes enviados a todos los grupos.");
    }
};
