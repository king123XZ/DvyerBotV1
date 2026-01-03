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

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            let msg = chatUpdate.messages[0];
            if (!msg.message) return;
            msg.message = msg.message.ephemeralMessage?.message || msg.message;
            if (msg.key.remoteJid === "status@broadcast") return;

            const cleanedMsg = smsg(sock, msg);
            if (typeof mainHandler === 'function') {
                await mainHandler(sock, cleanedMsg);
            }
        } catch (e) {
            console.error("Error en subbot:", e);
        }
    });

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                setTimeout(() => startSubBot(client, m, userNumber), 5000);
            }
        } else if (connection === "open") {
            await client.sendMessage(m.chat, { text: `✅ Sub-bot vinculado correctamente.` });
        }
    });

    if (!sock.authState.creds.registered) {
        await delay(5000);
        const code = await sock.requestPairingCode(userNumber.replace(/[^0-9]/g, ''));
        await client.sendMessage(m.chat, { text: `🔑 Código: *${code}*` });
    }
}

module.exports = { startSubBot };
