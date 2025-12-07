// ===============================
//  YERBOT - INDEX.JS COMPLETO
//  CON EL COMANDO antiViewOnce 100% FUNCIONAL
// ===============================

import makeWASocket, { 
    DisconnectReason, 
    useMultiFileAuthState, 
    downloadContentFromMessage 
} from "@whiskeysockets/baileys";
import fs from "fs";
import path from "path";
import P from "pino";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let antiViewOnce = true; // 🔥 ACTIVADO POR DEFECTO

// ===============================
// FUNCIÓN PRINCIPAL
// ===============================
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./session");

    const sock = makeWASocket({
        logger: P({ level: "silent" }),
        printQRInTerminal: true,
        auth: state,
        browser: ["YertxBot", "Chrome", "1.0"],
    });

    sock.ev.on("creds.update", saveCreds);

    // ===============================
    // ANTI-VIEW-ONCE  (🔥 100% REAL)
    // ===============================
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const m = messages[0];
        if (!m.message) return;
        const from = m.key.remoteJid;

        // Detecta que sea view once
        if (antiViewOnce && m.message.viewOnceMessageV2) {
            let msg = m.message.viewOnceMessageV2.message;

            // Foto
            if (msg.imageMessage) {
                const buffer = await downloadViewOnce(msg.imageMessage);
                await sock.sendMessage(from, { image: buffer, caption: "🔓 Vista desactivada (Anti-ViewOnce)" });
            }

            // Video
            if (msg.videoMessage) {
                const buffer = await downloadViewOnce(msg.videoMessage);
                await sock.sendMessage(from, { video: buffer, caption: "🔓 Vista desactivada (Anti-ViewOnce)" });
            }
        }

        // ===============================
        // COMANDOS
        // ===============================
        const body = (m.message.conversation
            || m.message.extendedTextMessage?.text
            || "").toLowerCase();

        if (body === ".desvista on") {
            antiViewOnce = true;
            await sock.sendMessage(from, { text: "🟢 Anti-ViewOnce ACTIVADO" });
        }

        if (body === ".desvista off") {
            antiViewOnce = false;
            await sock.sendMessage(from, { text: "🔴 Anti-ViewOnce DESACTIVADO" });
        }
    });

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                startBot();
            }
        }
        if (connection === "open") console.log("🔥 Bot conectado correctamente");
    });
}

// ===============================
// DESCARGA EL VIEW ONCE
// ===============================
async function downloadViewOnce(msg) {
    const type = msg.mimetype.startsWith("image") ? "image" : "video";
    const stream = await downloadContentFromMessage(msg, type);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    return buffer;
}

startBot();
