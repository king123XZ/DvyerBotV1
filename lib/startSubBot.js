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
 * startSubBot(number, mainHandler, client, m)
 * - number: internacional sin + (ej: 519xxxxxxxx)
 * - mainHandler: función de main.js
 * - client: bot principal (para responder por chat)
 * - m: mensaje
 */
async function startSubBot(number, mainHandler, client, m) {
  if (typeof mainHandler !== "function") throw new Error("mainHandler inválido (no es función)");
  if (!number || !/^[0-9]{7,15}$/.test(String(number))) {
    throw new Error("Número inválido. Usa formato internacional, solo dígitos (ej: 519xxxxxxxx).");
  }

  safeMkdir(SUBBOT_SESS_DIR);
  const sessionPath = path.join(SUBBOT_SESS_DIR, `subbot-${number}`);

  // ✅ siempre crea carpeta
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

  let pairingRequested = false;

  async function sendText(text) {
    try {
      if (m?.reply) return await m.reply(text);
      if (client?.sendMessage) return await client.sendMessage(client.user.id, { text });
    } catch {}
  }

  async function requestPairingWhenReady(update) {
    try {
      if (pairingRequested) return;
      if (state.creds.registered) return;

      // espera señal de emparejamiento
      if (!update?.qr && update?.connection !== "connecting") return;

      pairingRequested = true;

      const code = await sock.requestPairingCode(String(number));

      await sendText(
        `🔗 *Código de emparejamiento SubBot*\n` +
          `Número: *${number}*\n` +
          `Código: *${code}*\n\n` +
          `WhatsApp → Dispositivos vinculados → Vincular un dispositivo → *Vincular con código*`
      );
    } catch (e) {
      // si falla, limpia para reintentar
      clearSession(sessionPath);
      await sendText("❌ No se pudo generar el código. Se limpió la sesión. Vuelve a ejecutar *.subbot número*.");
    }
  }

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update || {};

    // intentar pairing si aún no está registrado
    if (!state.creds.registered) {
      await requestPairingWhenReady(update);
    }

    if (connection === "open") {
      console.log(`[SubBot ${number}] Connected ✅`);
      return;
    }

    if (connection === "close") {
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const reason = prettyDisconnect(code);

      console.log(`[SubBot ${number}] Connection closed. Code=${code} Reason=${reason}`);

      // ✅ Si loggedOut/badSession/forbidden: limpiar y NO reconectar en bucle
      if (
        code === DisconnectReason.loggedOut ||
        code === DisconnectReason.badSession ||
        code === DisconnectReason.forbidden
      ) {
        clearSession(sessionPath);
        await sendText(
          `⚠️ El SubBot *se deslogueó* (Code ${code}: ${reason}).\n` +
            `✅ Ya limpié la sesión.\n\n` +
            `Vuelve a ejecutar:\n*.subbot ${number}*`
        );
        try { sock.end?.(); } catch {}
        return;
      }

      // ✅ Para cierres normales, un reintento suave (1 vez)
      if (code === DisconnectReason.connectionClosed || code === DisconnectReason.connectionLost || code === DisconnectReason.timedOut) {
        setTimeout(() => {
          startSubBot(number, mainHandler, client, m).catch(() => {});
        }, 2500);
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

