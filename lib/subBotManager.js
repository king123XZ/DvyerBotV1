const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    delay,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const mainHandler = require('../main'); // Importante: importa el handler de tu main.js

async function startSubBot(client, m, userNumber) {
    const authPath = `./sessions/subbot-${userNumber}`;
    if (!fs.existsSync(authPath)) fs.mkdirSync(authPath, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        auth: state,
        version,
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["Sub-Bot", "Chrome", "1.0.0"]
    });

    if (!sock.authState.creds.registered) {
        await delay(5000); // Espera de seguridad para evitar Error 408
        try {
            const cleanNumber = userNumber.replace(/[^0-9]/g, '');
            const code = await sock.requestPairingCode(cleanNumber);
            await client.sendMessage(m.chat, { 
                text: `🔑 *CÓDIGO DE VINCULACIÓN*\n\nNúmero: ${cleanNumber}\nCódigo: *${code}*\n\n_Ingresa este código en "Vincular con número de teléfono" en tu WhatsApp._` 
            }, { quoted: m });
        } catch (err) {
            console.error("Error en pairing:", err);
            return client.sendMessage(m.chat, { text: "❌ WhatsApp rechazó la solicitud. Reintenta en 1 minuto." });
        }
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg.message) return;
            // Usa el handler de tu bot para que el subbot responda comandos
            await mainHandler(sock, msg); 
        } catch (e) {
            console.error("Error en subbot handler:", e);
        }
    });

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                startSubBot(client, m, userNumber); // Reconexión automática
            }
        } else if (connection === "open") {
            client.sendMessage(m.chat, { text: `✅ ¡Sub-bot conectado con éxito!\nSesión: ${userNumber}` });
        }
    });
}

module.exports = { startSubBot };
