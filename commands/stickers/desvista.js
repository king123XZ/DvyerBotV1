/**
 * DESVISTA PRIVADA CON CONTRASEÑA
 * Creado por Dvyer
 */

const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

const PASSWORD = "1234";
const TIME_LIMIT = 60000; // 60s

module.exports = {
  command: ["desvista", "abrirvista", "openview"],

  run: async (client, m) => {
    try {
      if (!m.quoted) return; // debe responder a un view once

      // Detectar view once real
      const q = m.quoted.message;
      const view =
        q?.viewOnceMessageV2?.message ||
        q?.viewOnceMessageV2Extension?.message ||
        q?.viewOnceMessage?.message ||
        (q?.imageMessage?.viewOnce && q) ||
        (q?.videoMessage?.viewOnce && q);

      if (!view) return; // silencio total

      const IMG = view.imageMessage;
      const VID = view.videoMessage;
      if (!IMG && !VID) return;

      const user = m.sender;

      // Mensaje privado solicitando contraseña
      await client.sendMessage(user, {
        text: "🔐 *Ingrese la contraseña para desbloquear la vista única:*\n\nEscriba: 1234"
      });

      // -------------------------
      // ESPERAR MENSAJE DEL USUARIO
      // -------------------------
      const passwordOK = await new Promise(resolve => {
        const listener = ({ messages }) => {
          const msg = messages[0];
          if (!msg.message) return;
          if (msg.key.fromMe) return;
          if (msg.key.remoteJid !== user) return;

          let text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            "";

          if (text.trim() === PASSWORD) {
            client.ev.off("messages.upsert", listener);
            resolve(true);
          }
        };

        client.ev.on("messages.upsert", listener);

        setTimeout(() => {
          client.ev.off("messages.upsert", listener);
          resolve(false);
        }, TIME_LIMIT);
      });

      if (!passwordOK) {
        await client.sendMessage(user, { text: "⏳ Tiempo agotado o contraseña incorrecta." });
        return;
      }

      // -------------------------
      // DESBLOQUEAR Y ENVIAR
      // -------------------------
      if (IMG) {
        const buffer = await downloadVO(IMG);
        return await client.sendMessage(user, {
          image: buffer,
          caption: "🔓 Vista única desbloqueada — Creado por Dvyer"
        });
      }

      if (VID) {
        const buffer = await downloadVO(VID);
        return await client.sendMessage(user, {
          video: buffer,
          caption: "🔓 Vista única desbloqueada — Creado por Dvyer"
        });
      }
    } catch (e) {
      console.log("ERROR DESVISTA:", e);
    }
  }
};

async function downloadVO(msg) {
  const type = msg.mimetype.split("/")[0];
  const stream = await downloadContentFromMessage(msg, type);
  let buffer = Buffer.from([]);
  for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
  return buffer;
}
