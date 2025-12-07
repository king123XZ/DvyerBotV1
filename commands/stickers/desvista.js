/**
 *  🔓 Código creado por Dvyer
 *  Abre vistas únicas y las envía al privado del dueño del bot
 *  Solo los números autorizados pueden usar este comando
 */

const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = {
  command: ["abrirvista", "openview", "desvista"],
  description: "Abre vistas únicas y las envía al privado del dueño del bot",

  run: async (client, m) => {
    try {

      // 🔐 NÚMEROS AUTORIZADOS
      const allowedUsers = [
        "51907376960@s.whatsapp.net",  // Tu número
        "51917391317@s.whatsapp.net",  // Número 2
        "519XXXXXXXX@s.whatsapp.net"   // Número 3 (reemplaza)
      ];

      // ⛔ Si el usuario NO está autorizado → no hacer nada
      if (!allowedUsers.includes(m.sender)) return;

      // ⛔ Debe responder a un mensaje
      if (!m.quoted) return;

      // 👑 PRIVADO DONDE SE ENVÍA LA VISTA ÚNICA (dueño del bot)
      const owner = client.user.id;

      const qMsg = m.quoted.message;

      // Detección de vista única correcta
      const view =
        qMsg?.viewOnceMessageV2?.message ||
        qMsg?.viewOnceMessageV2Extension?.message ||
        qMsg?.viewOnceMessage?.message ||
        qMsg;

      if (!view) return;

      // ¿Es imagen o video?
      const img = view.imageMessage;
      const vid = view.videoMessage;

      // 🖼️ Si es una imagen vista única
      if (img) {
        const buffer = await downloadVO(img);

        await client.sendMessage(owner, {
          image: buffer,
          caption: "🔓 *Vista única desbloqueada por Dvyer Bot*"
        });

        return;
      }

      // 🎬 Si es un video vista única
      if (vid) {
        const buffer = await downloadVO(vid);

        await client.sendMessage(owner, {
          video: buffer,
          caption: "🔓 *Vista única desbloqueada por Dvyer Bot*"
        });

        return;
      }

    } catch (err) {
      console.log("ERROR AL ABRIR VISTA ÚNICA:", err);
    }
  }
};

// 📥 Función para descargar vista única
async function downloadVO(msg) {
  const type = msg.mimetype.split("/")[0];
  const stream = await downloadContentFromMessage(msg, type);

  let buffer = Buffer.from([]);

  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk]);
  }

  return buffer;
}

