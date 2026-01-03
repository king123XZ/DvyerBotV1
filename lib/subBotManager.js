const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    delay 
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const path = require("path");
const fs = require("fs");

// Importas tu manejador de mensajes actual
const { smsg } = require('./simple'); // O como se llame tu export de formato
const { handler } = require('../main'); 

async function startSubBot(client, m, userNumber) {
    const authPath = `./sessions/subbot-${userNumber}`;
    if (!fs.existsSync(authPath)) fs.mkdirSync(authPath, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(authPath);

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, // Importante: No QR
        logger: pino({ level: "silent" }),
        browser: ["Sub-Bot", "Chrome", "1.0.0"]
    });

    // Si no está conectado, pedir Pairing Code
    if (!sock.authState.creds.registered) {
        await delay(3000); // Evitar el error 408 (Timeout)
        try {
            const code = await sock.requestPairingCode(userNumber.replace(/[^0-9]/g, ''));
            await client.sendMessage(m.chat, { text: `🔑 *Código de Vinculación para ${userNumber}:*\n\n#️⃣ ${code}` }, { quoted: m });
        } catch (err) {
            console.error("Error al pedir pairing code:", err);
            return client.sendMessage(m.chat, { text: "❌ Error: No se pudo generar el código. Reintenta en unos minutos." });
        }
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg.message) return;
            // Aquí reutilizas tu main.js pasándole el socket del subbot
            await handler(sock, msg); 
        } catch (e) {
            console.log("Error en subbot handler:", e);
        }
    });

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startSubBot(client, m, userNumber);
        } else if (connection === "open") {
            client.sendMessage(m.chat, { text: `✅ Sub-bot conectado con éxito en el número ${userNumber}` });
        }
    });
}

module.exports = { startSubBot };
