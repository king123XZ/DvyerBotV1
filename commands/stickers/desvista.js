/**
 * 🔓 Comando Desvista Privado con Contraseña
 * Creado por Dvyer
 */

const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

const PASSWORD = "1234"; // Contraseña fija

module.exports = {
    command: ["desvista", "abrirvista", "openview"],

    run: async (client, m) => {
        try {
            if (!m.quoted) return; // Debe responder a un mensaje

            // Obtener el mensaje original (posible vista única)
            const q = m.quoted.message;

            const view =
                q?.viewOnceMessageV2?.message ||
                q?.viewOnceMessageV2Extension?.message ||
                q?.viewOnceMessage?.message;

            if (!view) return; // No es vista única → no hacer nada

            // Guardar imagen/video para enviar luego
            const IMG = view.imageMessage;
            const VID = view.videoMessage;

            // 👉 El bot NO habla en el chat donde se mandó la vista

            const userPrivate = m.sender;

            // 📩 El bot envía mensaje al privado pidiendo contraseña
            const ask = await client.sendMessage(userPrivate, { 
                text: "🔐 *Responde a este mensaje con la contraseña para abrir la vista:*"
            });

            // Esperar respuesta SOLO si el usuario responde AL MENSAJE EN PRIVADO
            const confirmation = await client.waitForMessage({
                chatJid: userPrivate,
                sender: userPrivate,
                quoted: ask.key,     // 🔥 Debe responder exactamente a este mensaje
                timeout: 60000       // 1 minuto
            });

            if (!confirmation) {
                return client.sendMessage(userPrivate, { text: "⏳ *Tiempo expirado.*" });
            }

            if (confirmation.text !== PASSWORD) {
                return client.sendMessage(userPrivate, { text: "❌ *Contraseña incorrecta.*" });
            }

            // ------------------------------
            // 🔓 CONTRASEÑA CORRECTA → ENVIAR IMAGEN/VIDEO
            // ------------------------------

            if (IMG) {
                const buf = await downloadViewOnce(IMG);
                return client.sendMessage(userPrivate, {
                    image: buf,
                    caption: "🔓 *Vista desbloqueada — Enviado por Dvyer*"
                });
            }

            if (VID) {
                const buf = await downloadViewOnce(VID);
                return client.sendMessage(userPrivate, {
                    video: buf,
                    caption: "🔓 *Vista desbloqueada — Enviado por Dvyer*"
                });
            }

        } catch (e) {
            console.log("Error desvista:", e);
        }
    }
};


// 📥 Función para descargar imágenes/videos de vista única
async function downloadViewOnce(msg) {
    const type = msg.mimetype.split("/")[0];
    const stream = await downloadContentFromMessage(msg, type);

    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    return buffer;
}
