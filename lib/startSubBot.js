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

const { smsg } = require("./message");

const SUBBOT_SESS_DIR = path.join(__dirname, "../sessions/subbots");
const RECONNECT_DELAY = 3000;

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

/**
 * Inicia un SubBot con sesión propia.
 * number: internacional SIN + (ej: 519xxxxxxxx)
 */
async function startSubBot(number, mainHandler, conn, m) {
  if (typeof mainHandler !== "function") {
    throw new Error("mainHandler inválido (no es función)");
  }

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
    printQRInTerminal: false, // no QR en consola
    browser: ["Killua-SubBot", "Chrome", "1.0"],
    syncFullHistory: false,
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: false,
  });

  sock.ev.on("creds.update", saveCreds);

  // ✅ Pedir el pairing code cuando ya haya "qr" (cuando la conexión está lista para emparejar)
  let pairingRequested = false;

  const maybeRequestPairing = async (update) => {
    try {
      if (pairingRequested) return;
      if (state.creds.registered) return;

      // La señal más confiable de que ya está listo para emparejar:
      // cuando aparece update.qr (aunque no imprimamos el QR)
      if (!update?.qr && update?.connection !== "connecting") return;

      pairingRequested = true;

      const code = await sock.requestPairingCode(String(number));

      const text =
        `🔗 *Código de emparejamiento SubBot*\n` +
        `Número: *${number}*\n` +
        `Código: *${code}*\n\n` +
        `WhatsApp → Dispositivos vinculados → Vincular un dispositivo → *Vincular con código*`;

      if (m?.reply) await m.reply(text);
      else if (conn?.sendMessage) await conn.sendMessage(conn.user.id, { text });
    } catch (e) {
      // Si falla el emparejamiento, limpia sesión para reintentar bien
      clearSession(sessionPath);
      if (m?.reply) await m.reply("❌ No se pudo generar el código de emparejamiento. Verifica el número e intenta de nuevo.");
      throw e;
    }
  };

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update || {};

    // Intenta pedir el pairing code en el momento correcto
    if (!state.creds.registered) {
      await maybeRequestPairing(update).catch(() => {});
    }

    if (connection === "close") {
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const reason = prettyDisconnect(code);

      console.log(`[SubBot ${number}] Connection closed. Code=${code} Reason=${reason}`);

      // Si está baneada/cerrada sesión, limpia
      if (code === DisconnectReason.loggedOut || code === DisconnectReason.forbidden || code === DisconnectReason.badSession) {
        clearSession(sessionPath);
      }

      // Reintento simple
      setTimeout(() => {
        startSubBot(number, mainHandler, conn, m).catch(() => {});
      }, RECONNECT_DELAY);
    }

    if (connection === "open") {
      console.log(`[SubBot ${number}] Connected ✅`);
    }
  });

  // Mensajes -> smsg -> mainHandler
  sock.ev.on("messages.upsert", async ({ messages }) => {
    try {
      const mSubRaw = messages?.[0];
      if (!mSubRaw?.message) return;
      if (mSubRaw.key?.remoteJid === "status@broadcast") return;

      const msg = smsg(sock, mSubRaw);
      await mainHandler(sock, msg);
    } catch (e) {
      console.log("❌ Error en el handler del subbot:", e);
    }
  });

  return sock;
}

module.exports = { startSubBot };
