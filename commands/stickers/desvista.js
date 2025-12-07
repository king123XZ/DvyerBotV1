/**
 * 🔓 Comando Desvista Privado con Contraseña
 * Creado por Dvyer
 */

const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

// Contraseña fija para permitir el envío
const PASSWORD = "1234";

module.exports = {
    command: ["desvista", "abrirvista", "openview"],

    run: async (client, m) => {
        try {
            // Debe responder a un mensaje
            if (!m.quoted) return;

            // Esperar la contraseña del usuario
            await client.sendMessage(m.chat, { text: "🔐 *Ingresa la contraseña para abrir la vista:*" });

            const confirmation = await client.awaitMessage(m.chat, m.sender, 60000);
            if (!confirmation) return;

            if (confirmation.text !== PASSWORD) {
                return client.sendMessage(m.chat, { text: "❌ *Contraseña incorrecta.*" });
            }

            // Extraer mensaje view once
            const qMsg = m.quoted.message;

            const view =
                qMsg?.viewOnceMessageV2?.message ||
                qMsg?.viewOnceMessageV2Extension?.message ||
                qMsg?.viewOnceMessage?.message;

            if (!view) return;

            const img = view.imageMessage;
            const vid = view.videoMessage;

            // 🧾 Definir el JID privado del usuario
            const userPrivate = m.sender;

            // 🖼️ Imagen
            if (img) {
                const buffer = await downloadViewOnce(img);

                return client.sendMessage(userPrivate, {
                    image: buffer,
                    caption: "🔓 *Vista desbloqueada — Enviado por Dvyer*"
                });
            }

            // 🎥 Video
            if (vid) {
                const buffer = await downloadViewOnce(vid);

                return client.sendMessage(userPrivate, {
                    video: buffer,
                    caption: "🔓 *Vista desbloqueada — Enviado por Dvyer*"
                });
            }

        } catch (err) {
            console.log("Error en vista:", err);
        }
    }
};

// Descargar contenido de vista única
async function downloadViewOnce(msg) {
    const type = msg.mimetype.split("/")[0];
    const stream = await downloadContentFromMessage(msg, type);

    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    return buffer;
}
