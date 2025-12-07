
const { default: makeWASocket, useSingleFileAuthState, fetchLatestBaileysVersion, downloadContentFromMessage, proto } = require("@whiskeysockets/baileys");
const { state, saveState } = require("./auth_info.json"); // Ajusta según tu archivo
const P = require("pino");
const fs = require("fs");
const path = require("path");

async function startWhatsApp() {
    const { version } = await fetchLatestBaileysVersion();
    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
        logger: P({ level: "silent" })
    });

    sock.ev.on("creds.update", saveState);

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || !msg.key.fromMe) return;

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        if (!text || !text.startsWith("/enviaragrupos")) return;

        const mensaje = text.replace("/enviaragrupos ", "") || "";

        // Obtener todos los chats y filtrar solo grupos
        const allChats = await sock.store.chats.all();
        const grupos = allChats.filter(c => c.id.endsWith("@g.us"));

        // Detectar tipo de mensaje
        const messageType = Object.keys(msg.message)[0]; // textMessage, imageMessage, videoMessage, documentMessage, audioMessage

        // Descargar media si existe
        let buffer = null;
        let mimetype = "";
        let filename = "";

        if (messageType !== "conversation" && messageType !== "extendedTextMessage") {
            const media = msg.message[messageType];
            mimetype = media.mimetype || "";
            const stream = await downloadContentFromMessage(msg.message[messageType], messageType.replace("Message", ""));
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            buffer = Buffer.concat(chunks);

            // Nombre de archivo
            const ext = mimetype.split("/")[1] || "bin";
            filename = `temp.${ext}`;
            fs.writeFileSync(filename, buffer);
        }

        for (let i = 0; i < grupos.length; i++) {
            const grupoId = grupos[i].id;
            try {
                switch (messageType) {
                    case "conversation":
                    case "extendedTextMessage":
                        await sock.sendMessage(grupoId, { text: mensaje });
                        break;
                    case "imageMessage":
                        await sock.sendMessage(grupoId, { image: buffer, caption: mensaje });
                        break;
                    case "videoMessage":
                        await sock.sendMessage(grupoId, { video: buffer, caption: mensaje });
                        break;
                    case "audioMessage":
                        await sock.sendMessage(grupoId, { audio: buffer, mimetype: mimetype });
                        break;
                    case "documentMessage":
                        await sock.sendMessage(grupoId, { document: buffer, fileName: media.fileName || filename, mimetype: mimetype, caption: mensaje });
                        break;
                    default:
                        await sock.sendMessage(grupoId, { text: mensaje });
                }
                console.log(`Mensaje enviado a: ${grupoId}`);
            } catch (err) {
                console.log(`Error enviando a ${grupoId}: ${err.message}`);
            }

            // Espera 5 segundos antes del siguiente grupo
            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        // Eliminar archivo temporal si existe
        if (buffer) fs.unlinkSync(filename);

        console.log("Mensajes enviados a todos los grupos.");
    });
}

startWhatsApp();
