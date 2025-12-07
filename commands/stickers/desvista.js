/**
 *  Desvista Privado con verificación por respuesta (versión robusta)
 *  Creado por Dvyer — versión mejorada para detectar respuestas/quoted en muchas formas
 */

const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

const PASSWORD = "1234";
const WAIT_TIMEOUT = 60 * 1000; // 60 segundos
const DEBUG = false; // Pon true si quieres mensajes de depuración en privado (temporal)

module.exports = {
  command: ["desvista", "abrirvista", "openview"],
  description: "Enviar vista única al privado del usuario después de verificar contraseña",

  run: async (client, m) => {
    try {
      if (!m.quoted) return; // Debe responder a un mensaje en el chat original

      const q = m.quoted.message;

      const view =
        q?.viewOnceMessageV2?.message ||
        q?.viewOnceMessageV2Extension?.message ||
        q?.viewOnceMessage?.message ||
        (q?.imageMessage?.viewOnce === true && q) ||
        (q?.videoMessage?.viewOnce === true && q);

      if (!view) {
        // silencioso: no responde en el chat original
        if (DEBUG) await client.sendMessage(m.sender, { text: "DEBUG: No detecté view-once en el mensaje citado." });
        return;
      }

      const IMG = view.imageMessage || null;
      const VID = view.videoMessage || null;
      if (!IMG && !VID) {
        if (DEBUG) await client.sendMessage(m.sender, { text: "DEBUG: view-once detectado pero sin image/video." });
        return;
      }

      const userJid = m.sender; // privado del usuario que ejecutó el comando

      // 1) Preguntar en privado (el bot envía un mensaje y debe ser RESPONDIDO citándolo)
      const ask = await client.sendMessage(userJid, {
        text: "🔐 Responde a *este mensaje* con la contraseña para abrir la vista única."
      });

      if (DEBUG) await client.sendMessage(userJid, { text: `DEBUG: askId=${ask.key.id}` });

      // 2) Esperar respuesta robusta
      const confirmation = await waitForReply(client, {
        chatJid: userJid,
        sender: userJid,
        quotedMsgId: ask.key.id,
        timeout: WAIT_TIMEOUT
      });

      if (!confirmation) {
        if (DEBUG) await client.sendMessage(userJid, { text: "DEBUG: no recibí respuesta en tiempo." });
        await client.sendMessage(userJid, { text: "⏳ Tiempo expirado. Vuelve a intentar si lo deseas." });
        return;
      }

      // Extraer texto de confirmación (varias rutas)
      const confText =
        confirmation.message?.conversation ||
        confirmation.message?.extendedTextMessage?.text ||
        "";

      if ((confText || "").trim() !== PASSWORD) {
        // si quiso citar pero puso texto distinto
        await client.sendMessage(userJid, { text: "❌ Contraseña incorrecta." });
        return;
      }

      // ✅ Contraseña correcta -> descargar y enviar el contenido al privado
      if (IMG) {
        const buffer = await downloadViewOnce(IMG);
        await client.sendMessage(userJid, { image: buffer, caption: "🔓 Vista única desbloqueada — Creado por Dvyer" });
        return;
      }

      if (VID) {
        const buffer = await downloadViewOnce(VID);
        await client.sendMessage(userJid, { video: buffer, caption: "🔓 Vista única desbloqueada — Creado por Dvyer" });
        return;
      }

    } catch (err) {
      console.error("desvista.js error:", err);
      try { await client.sendMessage(m.sender, { text: "❌ Error interno al procesar la vista." }); } catch(e){/* ignore */ }
    }
  }
};

/**
 * waitForReply: escucha mensajes.upsert y resuelve cuando el usuario responde CITANDO ask.key.id,
 * o cuando envía exactamente la contraseña en el privado (fallback).
 *
 * Opciones:
 * - chatJid: privado del usuario (ej: 519xxxxxxxx@s.whatsapp.net)
 * - sender: remitente esperado (mismo que chatJid)
 * - quotedMsgId: id del mensaje que debe haber sido citado por la respuesta
 * - timeout: ms
 */
function waitForReply(client, { chatJid, sender, quotedMsgId, timeout = 60000 }) {
  return new Promise((resolve) => {
    let done = false;

    const onUpsert = async ({ messages }) => {
      try {
        for (const msg of messages) {
          // solo mensajes del chat privado del usuario
          if (msg.key.remoteJid !== chatJid) continue;
          if (msg.key.fromMe) continue; // ignorar nuestros propios mensajes

          // remitente (en grupos msg.key.participant, en privado no)
          const actualSender = msg.key.participant ? msg.key.participant : msg.key.remoteJid;
          if (sender && actualSender !== sender) continue;

          // obtener texto si existe
          const text =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            "";

          // EXTRAER contextInfo robustamente
          const ctx = msg.message?.extendedTextMessage?.contextInfo || msg.message?.contextInfo || {};
          const quotedId1 = ctx?.stanzaId || null;
          const quotedId2 = ctx?.quotedMessage?.key?.id || null;
          const quotedId3 = ctx?.quotedMessage?.key?._serialized || null;
          const quotedId4 = ctx?.quotedMessage?.key?.remoteJid || null;

          const anyQuotedMatches =
            quotedId1 === quotedMsgId ||
            quotedId2 === quotedMsgId ||
            quotedId3 === quotedMsgId;

          // Aceptar si:
          // - cita exactamente el ask (anyQuotedMatches true)
          // OR
          // - NO cita pero escribe exactamente la contraseña (fallback)
          if (anyQuotedMatches || (text && text.trim() === PASSWORD)) {
            cleanup();
            done = true;
            resolve(msg);
            return;
          }

          // si debug activo, opcionalmente informar (se maneja en caller)
        }
      } catch (e) {
        // ignore
      }
    };

    const cleanup = () => {
      try { client.ev.off("messages.upsert", onUpsert); } catch (e) {}
      clearTimeout(timer);
    };

    client.ev.on("messages.upsert", onUpsert);

    const timer = setTimeout(() => {
      if (done) return;
      try { client.ev.off("messages.upsert", onUpsert); } catch (e) {}
      resolve(null);
    }, timeout);
  });
}

/**
 * Descarga view-once (image/video) y devuelve Buffer
 */
async function downloadViewOnce(msg) {
  const type = (msg.mimetype || "").split("/")[0] || "image";
  const stream = await downloadContentFromMessage(msg, type);
  let buffer = Buffer.from([]);
  for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
  return buffer;
}
