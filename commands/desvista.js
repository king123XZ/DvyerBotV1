const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = {
  command: ["abrirvista", "openview", "desvista"],

  run: async (client, m) => {
    try {
      if (!m.quoted) {
        return client.sendMessage(m.chat, { text: "⚠️ *Responde a una imagen o video de vista única.*" });
      }

      // 📌 Extraemos TODAS las posibles estructuras de view once
      const qMsg = m.quoted.message;

      const view =
        qMsg?.viewOnceMessageV2?.message ||
        qMsg?.viewOnceMessageV2Extension?.message ||
        qMsg?.viewOnceMessage?.message ||
        qMsg?.imageMessage?.viewOnce === true && qMsg ||
        qMsg?.videoMessage?.viewOnce === true && qMsg;

      if (!view) {
        return client.sendMessage(m.chat, { text: "❌ *Ese mensaje no es de vista única.*" });
      }

      const img = view.imageMessage;
      const vid = view.videoMessage;

      // 📸 Imagen
      if (img) {
        const buffer = await downloadViewOnce(img);
        return client.sendMessage(m.chat, {
          image: buffer,
          caption: "🔓 *Vista única desbloqueada*"
        });
      }

      // 🎥 Video
      if (vid) {
        const buffer = await downloadViewOnce(vid);
        return client.sendMessage(m.chat, {
          video: buffer,
          caption: "🔓 *Vista única desbloqueada*"
        });
      }

      return client.sendMessage(m.chat, { text: "⚠️ No se pudo abrir la vista única." });

    } catch (err) {
      console.log("ERROR VISTA:", err);
      return client.sendMessage(m.chat, { text: "❌ Ocurrió un error al intentar abrir la vista única." });
    }
  }
};


// 📥 Función para descargar imágenes/videos
async function downloadViewOnce(msg) {
  const type = msg.mimetype.split("/")[0];
  const stream = await downloadContentFromMessage(msg, type);

  let buffer = Buffer.from([]);
  for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

  return buffer;
}
