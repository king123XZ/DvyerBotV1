/**
 * DESVISTA PRIVADA AUTOMÁTICA
 * Creado por Dvyer
 */

const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = {
  command: ["desvista", "abrirvista", "openview"],

  run: async (client, m) => {
    try {
      if (!m.quoted)
        return client.sendMessage(m.chat, {
          text: "⚠️ *Responde a una imagen o video de vista única.*"
        });

      const q = m.quoted.message;

      // Detectamos cualquier tipo de vista única
      const view =
        q?.viewOnceMessageV2?.message ||
        q?.viewOnceMessageV2Extension?.message ||
        q?.viewOnceMessage?.message;

      if (!view)
        return client.sendMessage(m.chat, {
          text: "❌ *Ese mensaje no es de vista única.*"
        });

      const img = view.imageMessage;
      const vid = view.videoMessage;

      if (!img && !vid)
        return client.sendMessage(m.chat, {
          text: "⚠️ No se pudo abrir la vista única."
        });

      const user = m.sender; // tu privado

      // Descargamos imagen o video
      const buffer = await downloadVO(img || vid);

      // Enviamos al PRIVADO del usuario
      await client.sendMessage(user, {
        [img ? "image" : "video"]: buffer,
        caption: "🔓 *Vista única desbloqueada — Creado por Dvyer*"
      });

      // NO enviamos nada al chat público
      return;

    } catch (err) {
      console.error("ERROR DESVISTA:", err);
      return client.sendMessage(m.chat, {
        text: "❌ Ocurrió un error al intentar abrir la vista única."
      });
    }
  }
};

// Función para descargar view once
async function downloadVO(msg) {
  const type = msg.mimetype.split("/")[0];
  const stream = await downloadContentFromMessage(msg, type);
  let buffer = Buffer.from([]);
  for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
  return buffer;
}
