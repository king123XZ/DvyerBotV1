const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion,
    DisconnectReason,
    jidDecode,
    delay
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");

const mainHandler = require('../main'); 

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

    // --- ESTA FUNCIÓN ES VITAL PARA QUE RESPONDA ---
    sock.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            const decode = jidDecode(jid) || {};
            return decode.user && decode.server ? decode.user + "@" + decode.server : jid;
        }
        return jid;
    };

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            let msg = chatUpdate.messages[0];
            if (!msg || !msg.message) return;

            // Evitar que el bot se responda a sí mismo
            if (msg.key.fromMe) return;

            // Importamos smsg dinámicamente para formatear el mensaje
            const { smsg } = require('./message');
            const cleanedMsg = smsg(sock, msg);

            if (typeof mainHandler === 'function') {
                // Ejecutamos el handler usando la conexión del sub-bot
                await mainHandler(sock, cleanedMsg);
            }
        } catch (e) {
            console.error("Error procesando mensaje en sub-bot:", e);
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
            console.log(`✅ Sub-bot [${userNumber}] conectado y listo.`);
            await client.sendMessage(m.chat, { text: `✅ ¡Sub-bot vinculado! Ya puedes usar comandos desde el otro número.` });
        }
    });

    if (!sock.authState.creds.registered) {
        await delay(5000);
        const code = await sock.requestPairingCode(userNumber.replace(/[^0-9]/g, ''));
        await client.sendMessage(m.chat, { text: `🔑 Código de vinculación: *${code}*` });
    }
}

module.exports = { startSubBot };
