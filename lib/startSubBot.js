const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion,
    DisconnectReason,
    delay
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");

// IMPORTACIÓN CORRECTA
const mainHandler = require('../main'); 
const { smsg } = require('./message'); 

async function startSubBot(client, m, userNumber) {
    const authPath = path.join(__dirname, `../sessions/subbot-${userNumber}`);
    if (!fs.existsSync(authPath)) fs.mkdirSync(authPath, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        auth: state,
        version,
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    // --- PARTE DE MENSAJES CORREGIDA ---
    sock.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            let msg = chatUpdate.messages[0];
            if (!msg.message) return;

            msg.message = msg.message.ephemeralMessage?.message || msg.message;
            if (msg.key.remoteJid === "status@broadcast") return;

            // Formatear el mensaje para que mainHandler lo entienda
            const cleanedMsg = smsg(sock, msg);

            // EJECUCIÓN SEGURA
            if (mainHandler && typeof mainHandler === 'function') {
                await mainHandler(sock, cleanedMsg);
            }
        } catch (e) {
            console.error("Error en subbot:", e);
        }
    });
    // ... resto de tu código de creds.update y pairing code
