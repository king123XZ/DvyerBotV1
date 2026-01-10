/**
 *  🔓 Código creado por Dvyer
 *  Abre vistas únicas y las envía al privado del dueño del bot
 *  Solo los números autorizados pueden usar este comando
 */

const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = {
  command: ["ñam", "uff", ".","1","xd"],
   categoria: "dueño",
  description: "Abre vistas únicas y las envía al privado del dueño del bot",

  run: async (client, m) => {
    try {

      // 🔐 NÚMEROS AUTORIZADOS
      const allowedUsers = [
        "51907376960@s.whatsapp.net",  // Tu número
        "51917391317@s.whatsapp.net",  // Número 2
        "519XXXXXXXX@s.whatsapp.net"   // Número 3
      ];

      // ⛔ Si no está autorizado → no hacer nada
      if (!allowedUsers.includes(m.sender)) return;

      // Debe ser respuesta
      if (!m.quoted) return;

      // 👑 CONVERTIR ID DEL BOT → JID REAL
      const owner = client.decodeJid(client.user.id);

      const qMsg = m.quoted.message;

      // Buscar vista única
      const view =
        qMsg?.viewOnceMessageV2?.message ||
        qMsg?.viewOnceMessageV2Extension?.message ||
        qMsg?.viewOnceMessage?.message ||
        qMsg;

      if (!view) return;

      const img = view.imageMessage;
      const vid = view.videoMessage;

      // 🖼️ IMAGEN
      if (img) {
        const buffer = await downloadVO(img);

        await client.sendMessage(owner, {
          image: buffer,
          caption: "🔓 *Vista única desbloqueada — Dvyer Bot*"
        });

        return;
      }

      // 🎬 VIDEO
      if (vid) {
        const buffer = await downloadVO(vid);

        await client.sendMessage(owner, {
          video: buffer,
          caption: "🔓 *Vista única desbloqueada — Dvyer Bot*"
        });

        return;
      }

    } catch (err) {
      console.log("ERROR EN abrivista:", err);
    }
  }
};

// 📥 Descargar vista única
async function downloadVO(msg) {
  const type = msg.mimetype.split("/")[0];
  const stream = await downloadContentFromMessage(msg, type);

  let buffer = Buffer.from([]);

  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk]);
  }

  return buffer;
}
