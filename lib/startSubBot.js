const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion,
    DisconnectReason,
    jidDecode,
    delay,
    downloadContentFromMessage
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

    // 1. INYECTAMOS decodeJid (Vital para tu message.js)
    sock.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            const decode = jidDecode(jid) || {};
            return decode.user && decode.server ? decode.user + "@" + decode.server : jid;
        }
        return jid;
    };

    // 2. INYECTAMOS downloadMediaMessage (Tu message.js lo requiere)
    sock.downloadMediaMessage = async (message) => {
        let mime = (message.msg || message).mimetype || '';
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
        const stream = await downloadContentFromMessage(message, messageType);
        let buffer = Buffer.from([]);
        for await(const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
    };

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            let msg = chatUpdate.messages[0];
            if (!msg || !msg.message) return;
            if (msg.key.fromMe) return;

            // 3. FIX CRÍTICO: Aseguramos que sock.user exista antes de llamar a smsg
            // Tu message.js busca 'client.user.id', si no existe, falla.
            if (!sock.user && sock.authState.creds.me) {
                sock.user = sock.authState.creds.me;
                sock.user.id = sock.decodeJid(sock.user.id); // Asegurar formato correcto
            } else if (!sock.user) {
                // Si aún no carga credenciales, no podemos procesar comandos
                return;
            }

            // Ahora sí procesamos el mensaje
            const cleanedMsg = smsg(sock, msg);

            if (typeof mainHandler === 'function') {
                await mainHandler(sock, cleanedMsg);
            }
        } catch (e) {
            console.error("Error procesando comando en SubBot:", e);
        }
    });

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason === DisconnectReason.loggedOut) {
                console.log(`⚠️ Sesión cerrada para ${userNumber}. Eliminando datos...`);
                if (fs.existsSync(authPath)) fs.rmSync(authPath, { recursive: true, force: true });
            } else {
                setTimeout(() => startSubBot(client, m, userNumber), 5000);
            }
        } else if (connection === "open") {
            // Aseguramos que sock.user esté listo al conectar
            sock.user = sock.authState.creds.me;
            sock.user.id = sock.decodeJid(sock.user.id);
            console.log(`✅ Sub-bot conectado: ${sock.user.id}`);
        }
    });

    if (!sock.authState.creds.registered) {
        await delay(4000);
        try {
            const code = await sock.requestPairingCode(userNumber.replace(/[^0-9]/g, ''));
            await client.sendMessage(m.chat, { text: `🔑 Código: *${code}*` });
        } catch (e) {
            client.sendMessage(m.chat, { text: "⚠️ Espera unos segundos antes de pedir otro código." });
        }
    }
}

module.exports = { startSubBot };
