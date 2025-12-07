//
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = {
  command: ["abrirvista", "desvista", "openview"],

  run: async (client, m) => {
    try {
      // Debe responder al mensaje de vista única
      if (!m.quoted || !m.quoted.message) {
        return client.sendMessage(m.chat, { text: "⚠️ Responde a un mensaje de *vista única*." });
      }

      const view = m.quoted.message.viewOnceMessageV2 || m.quoted.message.viewOnceMessage;
      if (!view) {
        return client.sendMessage(m.chat, { text: "❌ Ese mensaje *no es* de vista única." });
      }

      const msg = view.message;

      // 📸 Imagen
      if (msg.imageMessage) {
        const buffer = await downloadView(msg.imageMessage);
        return client.sendMessage(m.chat, {
          image: buffer,
          caption: "🔓 Vista única desbloqueada"
        });
      }

      // 🎥 Video
      if (msg.videoMessage) {
        const buffer = await downloadView(msg.videoMessage);
        return client.sendMessage(m.chat, {
          video: buffer,
          caption: "🔓 Vista única desbloqueada"
        });
      }

    } catch (err) {
      console.log("Error abrir vista:", err);
      client.sendMessage(m.chat, { text: "❌ Error al desbloquear la vista única." });
    }
  }
};

// Función de descarga
async function downloadView(msg) {
  const type = msg.mimetype.split("/")[0]; // image / video
  const stream = await downloadContentFromMessage(msg, type);
  let buffer = Buffer.from([]);

  for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

  return buffer;
}
