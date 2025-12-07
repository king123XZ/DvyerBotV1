/**
 *  🔓 Código creado por Dvyer
 *  Vista única → enviada directo al privado del dueño del bot
 */

const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = {
  command: ["abrirvista", "openview", "desvista"],
  description: "Abre vistas únicas y las envía al privado del dueño",

  run: async (client, m) => {
    try {
      const owner = client.user.id; // 📌 Número dueño del bot
      const sender = m.sender || m.key.participant || m.key.remoteJid;

      // 🚫 Si NO es el dueño → no hace nada
      if (sender !== owner) return;

      // 📝 Debe responder a una vista única
      if (!m.quoted) return;

      const qMsg = m.quoted.message;

      const view =
        qMsg?.viewOnceMessageV2?.message ||
        qMsg?.viewOnceMessageV2Extension?.message ||
        qMsg?.viewOnceMessage?.message ||
        (qMsg?.imageMessage?.viewOnce === true && qMsg) ||
        (qMsg?.videoMessage?.viewOnce === true && qMsg);

      if (!view) return;

      const img = view.imageMessage;
      const vid = view.videoMessage;

      // 🖼️ Imagen
      if (img) {
        const buffer = await downloadViewOnce(img);

        await client.sendMessage(owner, {
          image: buffer,
          caption: "🔓 *Vista única desbloqueada — Enviada por Dvyer Bot*"
        });

        return;
      }

      // 🎥 Video
      if (vid) {
        const buffer = await downloadViewOnce(vid);

        await client.sendMessage(owner, {
          video: buffer,
          caption: "🔓 *Vista única desbloqueada — Enviada por Dvyer Bot*"
        });

        return;
      }

    } catch (err) {
      console.log("ERROR EN VISTA ÚNICA:", err);
      // ❌ No avisamos nada al usuario
    }
  }
};


// 📥 Descargar vista única
async function downloadViewOnce(msg) {
  const type = msg.mimetype.split("/")[0];
  const stream = await downloadContentFromMessage(msg, type);

  let buffer = Buffer.from([]);
  for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

  return buffer;
}
