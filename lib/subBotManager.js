const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    delay,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");

// Importamos el handler de tu main.js para que todos los bots tengan los mismos comandos
const { handler } = require('../main'); 

async function startSubBot(client, m, userNumber) {
    // Crear carpeta única para cada número
    const authPath = `./sessions/subbot-${userNumber}`;
    if (!fs.existsSync(authPath)) fs.mkdirSync(authPath, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        auth: state,
        version,
        printQRInTerminal: false, // No ensucia la consola del panel
        logger: pino({ level: "silent" }),
        browser: ["Sub-Bot Multi", "Chrome", "1.0.0"]
    });

    // Si no está registrado, pide el código de emparejamiento
    if (!sock.authState.creds.registered) {
        await delay(5000); // Delay crítico para evitar Error 408 en Pterodactyl
        try {
            const cleanNumber = userNumber.replace(/[^0-9]/g, '');
            const code = await sock.requestPairingCode(cleanNumber);
            
            // Enviamos el código al WhatsApp del que ejecutó el comando
            await client.sendMessage(m.chat, { 
                text: `🔑 *CÓDIGO PARA: ${cleanNumber}*\n\nCódigo: *${code}*\n\n_Vincúlalo en: Dispositivos vinculados > Vincular con número de teléfono._` 
            }, { quoted: m });
        } catch (err) {
            console.error("Error en Pairing:", err);
            return client.sendMessage(m.chat, { text: "❌ Error 408: WhatsApp rechazó la solicitud. Reintenta en 1 minuto." });
        }
    }

    sock.ev.on("creds.update", saveCreds);

    // Escuchador de mensajes para el Sub-Bot
    sock.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg.message) return;
            // Usamos el handler central
            await handler(sock, msg); 
        } catch (e) {
            console.error("Error en handler de subbot:", e);
        }
    });

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                // Reconexión automática si no fue cierre voluntario
                startSubBot(client, m, userNumber);
            }
        } else if (connection === "open") {
            client.sendMessage(m.chat, { text: `✅ ¡Sesión activa para ${userNumber}!` });
        }
    });
}

module.exports = { startSubBot };
