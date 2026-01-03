const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    delay,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const mainHandler = require('../main'); 

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
        browser: ["Sub-Bot", "Ubuntu", "3.0.0"]
    });

    if (!sock.authState.creds.registered) {
        await delay(5000); 
        try {
            const cleanNumber = userNumber.replace(/[^0-9]/g, '');
            const code = await sock.requestPairingCode(cleanNumber);
            await client.sendMessage(m.chat, { 
                text: `🔑 *CÓDIGO DE VINCULACIÓN*\n\nNúmero: ${cleanNumber}\nCódigo: *${code}*` 
            }, { quoted: m });
        } catch (err) {
            return client.sendMessage(m.chat, { text: "❌ Error 408: Tiempo de espera agotado en el servidor." });
        }
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg.message) return;
            await mainHandler(sock, msg); 
        } catch (e) {
            console.error("Error subbot:", e);
        }
    });

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) startSubBot(client, m, userNumber);
        } else if (connection === "open") {
            client.sendMessage(m.chat, { text: `✅ Sub-bot conectado en el servidor.` });
        }
    });
}

module.exports = { startSubBot };
