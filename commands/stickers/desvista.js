/**
 * DESVISTA PRIVADA CON CONTRASEÑA
 * Creado por Dvyer
 */

const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

// Guardamos contraseñas que se están esperando
global.waitingPassword = global.waitingPassword || {};

module.exports = {
  command: ["desvista", "abrirvista", "openview"],

  run: async (client, m) => {
    try {
      if (!m.quoted) return;

      const q = m.quoted.message;

      const view =
        q?.viewOnceMessageV2?.message ||
        q?.viewOnceMessageV2Extension?.message ||
        q?.viewOnceMessage?.message;

      if (!view) return;

      const img = view.imageMessage;
      const vid = view.videoMessage;
      if (!img && !vid) return;

      const user = m.sender;

      // Creamos la entrada del usuario que debe enviar contraseña
      waitingPassword[user] = {
        type: img ? "image" : "video",
        msg: img || vid,
        time: Date.now()
      };

      // Pedimos contraseña en privado
      await client.sendMessage(user, {
        text: "🔐 *Ingresa la contraseña para desbloquear la vista única:*\n\nEscribe: 1234"
      });

    } catch (e) {
      console.error("ERROR DESVISTA:", e);
    }
  }
};


// ==========================
// ESCUCHAMOS TODAS LAS PARTES
// ==========================
module.exports.before = async (client, m) => {
  try {
    const user = m.sender;

    // Si no estamos esperando su contraseña → ignorar
    if (!waitingPassword[user]) return;

    const text = m.text?.trim();
    if (!text) return;

    // Contraseña correcta
    if (text === "1234") {
      const data = waitingPassword[user];
      delete waitingPassword[user];

      const buffer = await downloadVO(data.msg);

      if (data.type === "image") {
        await client.sendMessage(user, {
          image: buffer,
          caption: "🔓 *Vista única desbloqueada — Creado por Dvyer*"
        });
      } else {
        await client.sendMessage(user, {
          video: buffer,
          caption: "🔓 *Vista única desbloqueada — Creado por Dvyer*"
        });
      }
      return;
    }

    // Contraseña incorrecta
    await client.sendMessage(user, {
      text: "❌ *Contraseña incorrecta.*\nVuelve a escribir: 1234"
    });

  } catch (err) {
    console.error("ERROR VALIDACIÓN:", err);
  }
};


// Función para descargar vista única
async function downloadVO(msg) {
  const type = msg.mimetype.split("/")[0];
  const stream = await downloadContentFromMessage(msg, type);
  let buffer = Buffer.from([]);
  for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
  return buffer;
}
