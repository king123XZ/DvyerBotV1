/**
 *  Desvista Privado con verificación por respuesta
 *  Creado por Dvyer
 *
 *  - El usuario ejecuta: .desvista (respondiendo a una vista única)
 *  - El bot abre el privado del usuario y envía un mensaje pidiendo contraseña
 *  - El usuario debe RESPONDER A ESE MENSAJE en privado con: 1234
 *  - Si la contraseña coincide, el bot envía la imagen/video al privado del usuario
 *  - No se escribe nada en el chat original
 */

const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

const PASSWORD = "1234";
const WAIT_TIMEOUT = 60 * 1000; // 60 segundos

module.exports = {
  command: ["desvista", "abrirvista", "openview"],
  description: "Enviar vista única al privado del usuario después de verificar contraseña",

  run: async (client, m) => {
    try {
      // 1) Validaciones básicas
      if (!m.quoted) return; // debe responder a un mensaje
      const q = m.quoted.message;

      // 2) Detectar la estructura view-once
      const view =
        q?.viewOnceMessageV2?.message ||
        q?.viewOnceMessageV2Extension?.message ||
        q?.viewOnceMessage?.message ||
        (q?.imageMessage?.viewOnce === true && q) ||
        (q?.videoMessage?.viewOnce === true && q);

      if (!view) return; // no es vista única -> silencioso

      // 3) Preparar el contenido para enviar luego
      const IMG = view.imageMessage || null;
      const VID = view.videoMessage || null;
      if (!IMG && !VID) return; // nada que enviar

      // 4) Identificar privado del usuario (owner = quien ejecutó el comando)
      const userJid = m.sender; // ej: 519xxxxxxxx@s.whatsapp.net

      // 5) Enviar mensaje en privado pidiendo que RESPONDA a ese mensaje con la contraseña
      const ask = await client.sendMessage(userJid, {
        text: "🔐 Responde a *este mensaje* con la contraseña para abrir la vista única."
      });

      // 6) Esperar la respuesta del usuario en privado que cite (reply) el 'ask'
      const confirmation = await waitForReplyToMessage(client, {
        chatJid: userJid,
        quotedMsgId: ask.key.id,
        sender: userJid,
        timeout: WAIT_TIMEOUT
      });

      // 7) Si no respondió en tiempo -> informar en privado y salir (silencioso en origen)
      if (!confirmation) {
        // opcional: avisamos en privado que caducó
        await client.sendMessage(userJid, { text: "⏳ Tiempo expirado. Vuelve a intentar si lo deseas." });
        return;
      }

      // 8) Obtener texto de la confirmación (soporta conversation o extendedTextMessage)
      const confText =
        confirmation.message?.conversation ||
        confirmation.message?.extendedTextMessage?.text ||
        "";

      if ((confText || "").trim() !== PASSWORD) {
        await client.sendMessage(userJid, { text: "❌ Contraseña incorrecta." });
        return;
      }

      // 9) Contraseña correcta -> descargar y enviar el contenido AL PRIVADO del usuario
      if (IMG) {
        const buffer = await downloadViewOnce(IMG);
        await client.sendMessage(userJid, {
          image: buffer,
          caption: "🔓 Vista única desbloqueada — Creado por Dvyer"
        });
        return;
      }

      if (VID) {
        const buffer = await downloadViewOnce(VID);
        await client.sendMessage(userJid, {
          video: buffer,
          caption: "🔓 Vista única desbloqueada — Creado por Dvyer"
        });
        return;
      }

    } catch (err) {
      console.error("desvista.js error:", err);
      // silencioso en el chat original; avisar solo en privado por seguridad
      try { await client.sendMessage(m.sender, { text: "❌ Error interno al procesar la vista." }); } catch(e){/* ignore */ }
    }
  }
};

/**
 * Espera una respuesta en privado que cite (reply) al mensaje `quotedMsgId`.
 * Devuelve el WebMessageInfo de la respuesta o null si timeout.
 */
function waitForReplyToMessage(client, { chatJid, quotedMsgId, sender, timeout = 60000 }) {
  return new Promise((resolve) => {
    let resolved = false;

    const handler = async ({ messages }) => {
      try {
        for (const msg of messages) {
          // Solo nos interesan mensajes que vengan al chat privado del usuario
          if (msg.key.remoteJid !== chatJid) continue;
          if (msg.key.fromMe) continue; // ignorar nuestros propios mensajes
          // Confirmar remitente exacto si viene de grupo/participant
          const actualSender = msg.key.participant ? msg.key.participant : msg.key.remoteJid;
          if (sender && actualSender !== sender) continue;

          // Texto del mensaje
          const text =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            "";

          // Verificar que el usuario respondió citando el mensaje (stanzaId / quotedMessage)
          const ctx = msg.message?.extendedTextMessage?.contextInfo || msg.message?.extendedTextMessage?.contextInfo;
          const quotedStanzaId = ctx?.stanzaId || ctx?.quotedMessage?.key?.id || ctx?.quotedMessage?.key?._serialized || ctx?.quotedMessage?.key?.id;

          // Algunos forks usan 'contextInfo.stanzaId', otros 'contextInfo.quotedMessage' con key.id
          const quotedMatches = quotedStanzaId === quotedMsgId;

          // Aceptar si cita EXACTAMENTE el ask OR (fallback) si NO cita pero el texto es la contraseña
          if (quotedMatches || (text && text.trim() === PASSWORD && !ctx?.stanzaId && !ctx?.quotedMessage)) {
            cleanup();
            resolved = true;
            resolve(msg);
            return;
          }

          // También aceptar si contextInfo.quotedMessage.key.id coincide (robusto)
          const ctxQuotedId = ctx?.quotedMessage?.key?.id;
          if (ctxQuotedId && ctxQuotedId === quotedMsgId) {
            cleanup();
            resolved = true;
            resolve(msg);
            return;
          }
        }
      } catch (e) {
        // ignore parsing errors
      }
    };

    const cleanup = () => {
      try {
        client.ev.off("messages.upsert", handler);
      } catch (e) { /* ignore */ }
      clearTimeout(timer);
    };

    client.ev.on("messages.upsert", handler);

    const timer = setTimeout(() => {
      if (resolved) return;
      try { client.ev.off("messages.upsert", handler); } catch (e) { /* ignore */ }
      resolve(null);
    }, timeout);
  });
}

/**
 * Descarga el contenido view-once (image/video) y devuelve Buffer
 */
async function downloadViewOnce(msg) {
  const type = (msg.mimetype || "").split("/")[0] || "image";
  const stream = await downloadContentFromMessage(msg, type);
  let buffer = Buffer.from([]);
  for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
  return buffer;
}
