/**
 *  🔓 Código creado por Dvyer
 *  Vista única → enviada al privado del dueño del bot
 *  Solo los números autorizados pueden usarlo
 */

const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = {
  command: ["abrirvista", "openview", "desvista"],
  description: "Abre vistas únicas y las envía al privado del dueño",

  run: async (client, m) => {
    try {

      // 🔐 LISTA DE NÚMEROS AUTORIZADOS
      const allowedUsers = [
        "51907376960@s.whatsapp.net",  // Tu número
        "xxxxxxxxxxx@s.whatsapp.net",  // Número 2
        "xxxxxxxxxxx@s.whatsapp.net"   // Número 3
      ];

      // ❌ Si NO está autorizado → ignorar
      if (!allowedUsers.includes(m.sender)) return;

      // ❌ Si no responden a una vista única → ignorar
      if (!m.quoted) return;

      // 📩 Enviar siempre al privado del dueño del bot
      const owner = client.user.id;

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

      // 🎬 Video
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
