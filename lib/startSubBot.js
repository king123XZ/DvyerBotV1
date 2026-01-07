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

if (!global.subBots) global.subBots = new Map();

const SUBBOT_SESS_DIR = path.join(__dirname, "../sessions/subbots");

function safeMkdir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function safeRm(dir) {
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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function startSubBot(number, mainHandler, client, m, attempt = 0) {
  if (typeof mainHandler !== "function") throw new Error("mainHandler inválido");
  if (!number || !/^[0-9]{7,15}$/.test(String(number))) throw new Error("Número inválido.");

  safeMkdir(SUBBOT_SESS_DIR);
  const sessionPath = path.join(SUBBOT_SESS_DIR, `subbot-${number}`);
  safeMkdir(sessionPath);

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: "fatal" }),
    printQRInTerminal: false, // ✅ NUNCA QR
    browser: ["Killua-SubBot", "Chrome", "1.0"],
    syncFullHistory: false,
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: false,
    connectTimeoutMs: 60_000,
    defaultQueryTimeoutMs: 60_000,
    keepAliveIntervalMs: 20_000,
  });

  // ✅ evita ENOENT: siempre asegura carpeta antes de guardar creds
  sock.ev.on("creds.update", async () => {
    safeMkdir(sessionPath);
    await saveCreds();
  });

  const sendText = async (text) => {
    try {
      if (m?.reply) return await m.reply(text);
      if (client?.sendMessage) return await client.sendMessage(client.user.id, { text });
    } catch {}
  };

  // ✅ Generar Pairing Code (solo si NO está registrado)
  // Lo intentamos varias veces porque a veces WhatsApp corta stream (515) si lo pides muy pronto.
  let codeSent = false;

  async function sendPairingCode() {
    if (codeSent) return;
    if (state.creds.registered) return;

    // Espera a que el socket “respire”
    await sleep(2500);

    for (let i = 1; i <= 5; i++) {
      try {
        const code = await sock.requestPairingCode(String(number));
        codeSent = true;

        console.log(`[SubBot ${number}] Pairing code: ${code}`);

        await sendText(
          `🔗 *Código de emparejamiento SubBot*\n` +
            `Número: *${number}*\n` +
            `Código: *${code}*\n\n` +
            `En tu WhatsApp (teléfono):\n` +
            `Dispositivos vinculados → Vincular un dispositivo → *Vincular con código*`
        );
        return;
      } catch (e) {
        // pequeño backoff
        await sleep(1500 + i * 300);
      }
    }

    await sendText(
      `⚠️ No pude generar el código para *${number}*.\n` +
      `Vuelve a intentar con: *.subbot ${number}*`
    );
  }

  // Lanzar intento de pairing (sin bloquear)
  sendPairingCode().catch(() => {});

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update || {};

    if (connection === "open") {
      console.log(`[SubBot ${number}] Connected ✅`);
      await sendText(`✅ SubBot *${number}* conectado y listo (usa el mismo handler que el bot principal).`);
      return;
    }

    if (connection === "close") {
      const boom = new Boom(lastDisconnect?.error);
      const code = boom?.output?.statusCode;
      const reason = prettyDisconnect(code);

      console.log(`[SubBot ${number}] Connection closed. Code=${code} Reason=${reason}`);
      console.log(`[SubBot ${number}] lastDisconnect.error =`, lastDisconnect?.error);

      // ✅ Si se reemplazó conexión (otro login), no insistir
      if (code === DisconnectReason.connectionReplaced) {
        await sendText(`⚠️ SubBot *${number}* fue reemplazado por otra sesión/dispositivo.`);
        try { sock.end?.(); } catch {}
        global.subBots.delete(number);
        return;
      }

      // ✅ Sesión inválida -> borrar y pedir reinicio manual
      if (
        code === DisconnectReason.loggedOut ||
        code === DisconnectReason.badSession ||
        code === DisconnectReason.forbidden
      ) {
        safeRm(sessionPath);
        await sendText(`🧹 Sesión inválida (Code ${code}). Ejecuta de nuevo: *.subbot ${number}*`);
        try { sock.end?.(); } catch {}
        global.subBots.delete(number);
        return;
      }

      // ✅ 515 restartRequired -> reconectar SIN borrar sesión
      if (code === DisconnectReason.restartRequired || code === 515) {
        await sleep(2500);
        try { sock.end?.(); } catch {}
        return startSubBot(number, mainHandler, client, m, attempt + 1);
      }

      // ✅ 428 / cierres comunes -> reintentar 2 veces
      if (
        code === DisconnectReason.connectionClosed ||
        code === DisconnectReason.connectionLost ||
        code === DisconnectReason.timedOut ||
        code === 428
      ) {
        if (attempt < 2) {
          await sleep(2500);
          try { sock.end?.(); } catch {}
          return startSubBot(number, mainHandler, client, m, attempt + 1);
        }
      }

      await sendText(`⚠️ SubBot *${number}* se cerró. Code ${code} (${reason}).`);
      try { sock.end?.(); } catch {}
      global.subBots.delete(number);
    }
  });

  // ✅ Aquí está lo clave: el subbot usa EXACTAMENTE el mismo mainHandler
  sock.ev.on("messages.upsert", async ({ messages }) => {
    try {
      const raw = messages?.[0];
      if (!raw?.message) return;
      if (raw.key?.remoteJid === "status@broadcast") return;

      const msg = smsg(sock, raw);
      await mainHandler(sock, msg);
    } catch (e) {
      console.log("❌ Error en handler subbot:", e);
    }
  });

  return sock;
}

module.exports = { startSubBot };
