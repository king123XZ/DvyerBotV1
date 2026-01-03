const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    delay,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const { handler } = require('../main'); // Asegúrate que main.js exporte el handler

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

    // Vincular mediante Pairing Code (Solución Error 408)
    if (!sock.authState.creds.registered) {
        await delay(5000); // Tiempo de espera para evitar saturación en VPS
        try {
            const cleanNumber = userNumber.replace(/[^0-9]/g, '');
            const code = await sock.requestPairingCode(cleanNumber);
            await client.sendMessage(m.chat, { 
                text: `🔑 *CÓDIGO DE VINCULACIÓN*\n\nNúmero: ${cleanNumber}\nCódigo: *${code}*\n\n_Ingresa este código en "Vincular un dispositivo" en tu WhatsApp._` 
            }, { quoted: m });
        } catch (err) {
            console.error("Error al generar pairing code:", err);
            return client.sendMessage(m.chat, { text: "❌ El servidor de WhatsApp rechazó la solicitud (408). Intenta de nuevo en 1 minuto." });
        }
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg.message) return;
            // Reutiliza la lógica principal de tu bot
            await handler(sock, msg); 
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
