/**
 *  Código creado por Dvyer — VistaOpener
 */

module.exports = {
    command: ["desvista", "abrirvista"],
    description: "Abre imágenes o videos enviados como vista previa (view once)",
    run: async (client, m) => {
        try {
            const message = m.message;

            // Validar que el contenido sea vista (view once)
            const viewOnce =
                message?.viewOnceMessage ||
                message?.viewOnceMessageV2 ||
                message?.viewOnceMessageV2Extension;

            if (!viewOnce) {
                return m.reply("⚠️ *El mensaje que respondiste NO es una vista previa.*\nEnvia o responde a una vista para abrirla.");
            }

            // Obtener el mensaje real dentro de la vista
            const inner = viewOnce.message;

            // Detectar si es imagen
            if (inner.imageMessage) {
                const buffer = await client.downloadMediaMessage({ message: inner });
                await client.sendMessage(m.chat, { image: buffer }, { quoted: m });
                return;
            }

            // Detectar si es video
            if (inner.videoMessage) {
                const buffer = await client.downloadMediaMessage({ message: inner });
                await client.sendMessage(m.chat, { video: buffer }, { quoted: m });
                return;
            }

            // Si no es foto ni video
            m.reply("⚠️ Esta vista no contiene una imagen ni un video compatible.");

        } catch (error) {
            console.error("Error en desvista.js:", error);
            m.reply("❌ Error interno al abrir la vista.");
        }
    }
};
