client.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m.message) return;

    const body = m.message.conversation || m.message.extendedTextMessage?.text || "";
    const command = body.trim().toLowerCase();

    // Guardamos el último mensaje recibido para verificar si era vista única
    if (m.message.viewOnceMessageV2 || m.message.viewOnceMessage) {
        global.lastViewOnce = m;
    }

    // Aquí el comando
    if (command === ".desvista") {

        if (!global.lastViewOnce) {
            return client.sendMessage(m.key.remoteJid, { text: "❌ No hay vista única reciente." });
        }

        const msg = global.lastViewOnce.message;
        const viewOnce = msg.viewOnceMessageV2?.message || msg.viewOnceMessage?.message;

        // Foto
        if (viewOnce.imageMessage) {
            const buffer = await client.downloadMediaMessage({ message: viewOnce });
            await client.sendMessage(m.key.remoteJid, { 
                image: buffer, 
                caption: "🔓 Vista única desbloqueada 😎" 
            });
        }

        // Video
        if (viewOnce.videoMessage) {
            const buffer = await client.downloadMediaMessage({ message: viewOnce });
            await client.sendMessage(m.key.remoteJid, { 
                video: buffer, 
                caption: "🔓 Vista única desbloqueada 🎥" 
            });
        }

        global.lastViewOnce = null; // Limpia
    }
});
