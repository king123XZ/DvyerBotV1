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
const { smsg } = require('./message'); 

async function startSubBot(client, m, userNumber) {
    const authPath = path.join(__dirname, `../sessions/subbot-${userNumber}`);
    
    // Asegurar que la carpeta exista o esté limpia
    if (!fs.existsSync(authPath)) {
        fs.mkdirSync(authPath, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        auth: state,
        version,
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        // Cambiamos el browser para evitar bloqueos de WhatsApp
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    // Inyectamos funciones que tu lib/message.js necesita
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
            
            const cleanedMsg = smsg(sock, msg);
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
            if (reason === DisconnectReason.loggedOut) {
                // Borramos carpeta si se desconecta (tu petición)
                if (fs.existsSync(authPath)) fs.rmSync(authPath, { recursive: true, force: true });
                client.sendMessage(m.chat, { text: "🚫 Sesión cerrada y carpeta eliminada." });
            } else {
                setTimeout(() => startSubBot(client, m, userNumber), 5000);
            }
        } else if (connection === "open") {
            client.sendMessage(m.chat, { text: `✅ Sub-bot [${userNumber}] conectado correctamente.` });
        }
    });

    // SOLICITUD DE CÓDIGO
    if (!sock.authState.creds.registered) {
        await delay(3000);
        try {
            const cleanNumber = userNumber.replace(/[^0-9]/g, '');
            const code = await sock.requestPairingCode(cleanNumber);
            await client.sendMessage(m.chat, { text: `🔑 Código de vinculación: *${code}*` });
        } catch (err) {
            console.error("Error al pedir pairing code:", err);
            client.sendMessage(m.chat, { text: "❌ WhatsApp rechazó la solicitud de código. Intenta de nuevo en un momento." });
        }
    }
}

module.exports = { startSubBot };
