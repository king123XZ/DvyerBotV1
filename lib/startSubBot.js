const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion 
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");

// IMPORTACIONES CRÍTICAS
const mainHandler = require('../main'); 
const { smsg } = require('./message'); // Asegúrate de que la ruta a message.js sea correcta

async function startSubBot(client, m, userNumber) {
    // ... (mantén tu lógica de authPath y sock igual)

    sock.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            let msg = chatUpdate.messages[0];
            if (!msg.message) return;

            // Limpieza de mensaje igual que en tu index.js
            msg.message = msg.message.ephemeralMessage?.message || msg.message;
            if (msg.key.remoteJid === "status@broadcast") return;

            // FORMATEO DEL MENSAJE (Vital para que mainHandler lo reconozca)
            const cleanedMsg = smsg(sock, msg);

            // EJECUCIÓN DEL HANDLER
            if (typeof mainHandler === 'function') {
                await mainHandler(sock, cleanedMsg); 
            }
        } catch (e) {
            console.error("Error subbot:", e);
        }
    });

    // ... (resto de tu conexión)
}

module.exports = { startSubBot };
