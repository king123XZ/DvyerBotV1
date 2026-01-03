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
            if (!msg || !msg.message || msg.key.fromMe) return;

            let cleanedMsg;
            try {
                const { smsg } = require('./message');
                cleanedMsg = smsg(sock, msg);
            } catch (e) {
                cleanedMsg = msg;
            }

            if (typeof mainHandler === 'function') {
                await mainHandler(sock, cleanedMsg);
            }
        } catch (e) {
            console.error("Error en sub-bot:", e);
        }
    });

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            
            // Si la desconexión es porque se cerró sesión (Logged Out)
            if (reason === DisconnectReason.loggedOut) {
                console.log(`⚠️ Sesión cerrada para ${userNumber}. Borrando carpeta...`);
                try {
                    // Borra la carpeta de sesión para que no de errores la próxima vez
                    fs.rmSync(authPath, { recursive: true, force: true });
                    await client.sendMessage(m.chat, { text: `🚫 Sesión cerrada. La carpeta del subbot ${userNumber} ha sido eliminada.` });
                } catch (err) {
                    console.error("Error al borrar carpeta:", err);
                }
            } else {
                // Si es otro error (como internet), reintenta conectar
                setTimeout(() => startSubBot(client, m, userNumber), 5000);
            }
        } else if (connection === "open") {
            console.log(`✅ Sub-bot [${userNumber}] conectado.`);
        }
    });

    if (!sock.authState.creds.registered) {
        await delay(5000);
        const code = await sock.requestPairingCode(userNumber.replace(/[^0-9]/g, ''));
        await client.sendMessage(m.chat, { text: `🔑 Código: *${code}*` });
    }
}

module.exports = { startSubBot };
