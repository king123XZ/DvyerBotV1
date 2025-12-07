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
      if (!m.quoted) {
        return client.sendMessage(m.chat, { 
          text: "⚠️ *Responde a una imagen o video de vista única.*" 
        });
      }

      // 📌 Dueño del bot (su propio WhatsApp)
      const owner = client.user.id;  

      const qMsg = m.quoted.message;

      const view =
        qMsg?.viewOnceMessageV2?.message ||
        qMsg?.viewOnceMessageV2Extension?.message ||
        qMsg?.viewOnceMessage?.message ||
        (qMsg?.imageMessage?.viewOnce === true && qMsg) ||
        (qMsg?.videoMessage?.viewOnce === true && qMsg);

      if (!view) {
        return client.sendMessage(m.chat, { 
          text: "❌ *Ese mensaje no es de vista única.*" 
        });
      }

      const img = view.imageMessage;
      const vid = view.videoMessage;

      // 🖼️ Imagen
      if (img) {
        const buffer = await downloadViewOnce(img);

        // Enviar al privado del dueño
        await client.sendMessage(owner, {
          image: buffer,
          caption: "🔓 *Vista única desbloqueada — Enviada por Dvyer Bot*"
        });

        return client.sendMessage(m.chat, { 
          text: "📩 *Vista enviada a tu privado.*" 
        });
      }

      // 🎬 Video
      if (vid) {
        const buffer = await downloadViewOnce(vid);

        await client.sendMessage(owner, {
          video: buffer,
          caption: "🔓 *Vista única desbloqueada — Enviada por Dvyer Bot*"
        });

        return client.sendMessage(m.chat, { 
          text: "📩 *Vista enviada a tu privado.*" 
        });
      }

      return client.sendMessage(m.chat, { 
        text: "⚠️ No se pudo abrir la vista única." 
      });

    } catch (err) {
      console.log("ERROR EN VISTA ÚNICA:", err);
      return client.sendMessage(m.chat, { 
        text: "❌ Ocurrió un error al intentar abrir la vista única." 
      });
    }
  }
};

// 📥 Función para descargar imágenes y videos de vista única
async function downloadViewOnce(msg) {
  const type = msg.mimetype.split("/")[0];
  const stream = await downloadContentFromMessage(msg, type);

  let buffer = Buffer.from([]);
  for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

  return buffer;
}
