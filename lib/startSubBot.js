const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const fs = require("fs");
const path = require("path");
const { Boom } = require("@hapi/boom");

const QRCode = require("qrcode");
const { smsg } = require("./message");

const SUBBOT_SESS_DIR = path.join(__dirname, "../sessions/subbots");

function safeMkdir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function clearSession(dir) {
  try {
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}

function prettyDisconnect(code) {
  const map = {
    [DisconnectReason.loggedOut]: "loggedOut",
    [DisconnectReason.forbidden]: "forbidden",
    [DisconnectReason.connectionClosed]: "connectionClosed",
    [DisconnectReason.connectionLost]: "connectionLost",
    [DisconnectReason.connectionReplaced]: "connectionReplaced",
    [DisconnectReason.restartRequired]: "restartRequired",
    [DisconnectReason.timedOut]: "timedOut",
    [DisconnectReason.badSession]: "badSession",
  };
  return map[code] || String(code);
}

async function startSubBot(number, mainHandler, client, m) {
  if (typeof mainHandler !== "function") throw new Error("mainHandler inválido (no es función)");
  if (!number || !/^[0-9]{7,15}$/.test(String(number))) {
    throw new Error("Número inválido. Usa formato internacional, solo dígitos (ej: 519xxxxxxxx).");
  }

  safeMkdir(SUBBOT_SESS_DIR);
  const sessionPath = path.join(SUBBOT_SESS_DIR, `subbot-${number}`);
  safeMkdir(sessionPath);

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: "fatal" }),
    printQRInTerminal: false,
    browser: ["Killua-SubBot", "Chrome", "1.0"],
    syncFullHistory: false,
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: false,
  });

  sock.ev.on("creds.update", saveCreds);

  const sendText = async (text) => {
    try {
      if (m?.reply) return await m.reply(text);
      if (client?.sendMessage) return await client.sendMessage(client.user.id, { text });
    } catch {}
  };

  const sendQR = async (qrString) => {
    try {
      const pngBuffer = await QRCode.toBuffer(qrString, { type: "png", scale: 8 });
      // Manda el QR al mismo chat donde se ejecutó el comando
      if (client?.sendMessage && m?.chat) {
        await client.sendMessage(
          m.chat,
          {
            image: pngBuffer,
            caption:
              `📲 *Escanea este QR para vincular el SubBot*\n\n` +
              `WhatsApp (en el teléfono) → *Dispositivos vinculados* → *Vincular un dispositivo* → escanea.\n` +
              `Número: *${number}*`,
          },
          { quoted: m }
        );
      } else {
        await sendText("⚠️ No pude enviar la imagen QR (no hay client/m.chat).");
      }
    } catch (e) {
      await sendText("⚠️ No pude generar/enviar el QR.");
    }
  };

  let triedPairing = false;

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update || {};

    // Si aparece QR, lo mandamos (esto funciona incluso cuando pairing code no)
    if (qr) {
      await sendQR(qr);
    }

    // Intento de pairing code (solo 1 vez) - si tu cuenta lo soporta, te manda un código por chat
    // OJO: igual debes meterlo manualmente en Dispositivos vinculados.
    if (!state.creds.registered && !triedPairing) {
      // Solo intentarlo cuando está "connecting" o ya hay qr
      if (connection === "connecting" || qr) {
        triedPairing = true;
        try {
          const code = await sock.requestPairingCode(String(number));
          await sendText(
            `🔗 *Código de emparejamiento SubBot*\n` +
              `Número: *${number}*\n` +
              `Código: *${code}*\n\n` +
              `En tu WhatsApp (teléfono): Dispositivos vinculados → Vincular un dispositivo → *Vincular con código*.`
          );
        } catch (e) {
          // Si falla, no pasa nada: QR ya será el método
          await sendText("⚠️ Pairing code no disponible; usa el QR que te envié para vincular.");
        }
      }
    }

    if (connection === "open") {
      console.log(`[SubBot ${number}] Connected ✅`);
      return;
    }

    if (connection === "close") {
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const reason = prettyDisconnect(code);

      console.log(`[SubBot ${number}] Connection closed. Code=${code} Reason=${reason}`);

      // ✅ 401 / badSession / forbidden => limpiar y pedir reintento manual
      if (
        code === DisconnectReason.loggedOut ||
        code === DisconnectReason.badSession ||
        code === DisconnectReason.forbidden
      ) {
        clearSession(sessionPath);
        await sendText(
          `⚠️ El SubBot quedó *deslogueado* (Code ${code}: ${reason}).\n` +
            `✅ Se limpió la sesión.\n\n` +
            `Haz esto:\n` +
            `1) Ejecuta de nuevo: *.subbot ${number}*\n` +
            `2) Escanea el QR que te enviaré (método más seguro).`
        );
        try { sock.end?.(); } catch {}
        return;
      }

      // Para cierres normales, NO reconectar en loop (solo informamos)
      if (code === DisconnectReason.connectionClosed || code === DisconnectReason.connectionLost || code === DisconnectReason.timedOut) {
        await sendText("⚠️ La conexión del SubBot se cerró. Vuelve a ejecutar *.subbot número* para reintentar.");
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    try {
      const raw = messages?.[0];
      if (!raw?.message) return;
      if (raw.key?.remoteJid === "status@broadcast") return;

      const msg = smsg(sock, raw);
      await mainHandler(sock, msg);
    } catch (e) {
      console.log("❌ Error en el handler del subbot:", e);
    }
  });

  return sock;
}

module.exports = { startSubBot };
