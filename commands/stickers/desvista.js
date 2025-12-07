/**
 * 🔥 Sistema Anti-ViewOnce Automático
 * Creado por Dvyer
 */

import makeWASocket, { downloadContentFromMessage } from "@whiskeysockets/baileys";

sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0];
    if (!m.message) return;

    const from = m.key.remoteJid;

    // 📌 Identificar vista única en TODOS los chats
    const view =
        m.message?.viewOnceMessageV2?.message ||
        m.message?.viewOnceMessageV2Extension?.message ||
        m.message?.viewOnceMessage?.message;

    if (!view) return;

    const img = view.imageMessage;
    const vid = view.videoMessage;

    // 💎 Donde se enviará la vista única — TU PRIVADO
    const owner = sock.user.id;

    // 🖼️ Imagen
    if (img) {
        const buffer = await downloadViewOnce(img);

        await sock.sendMessage(owner, {
            image: buffer,
            caption: "🔓 *Vista única recibida automáticamente — Dvyer Bot*"
        });

        return;
    }

    // 🎥 Video
    if (vid) {
        const buffer = await downloadViewOnce(vid);

        await sock.sendMessage(owner, {
            video: buffer,
            caption: "🔓 *Vista única recibida automáticamente — Dvyer Bot*"
        });

        return;
    }
});

// 📥 Descargar contenido
async function downloadViewOnce(msg) {
    const type = msg.mimetype.split("/")[0];
    const stream = await downloadContentFromMessage(msg, type);

    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }

    return buffer;
}
