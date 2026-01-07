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
    printQRInTerminal: false, // ✅ solo code
    browser: ["Killua-SubBot", "Chrome", "1.0"],
    syncFullHistory: false,
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: false,
    connectTimeoutMs: 60_000,
    defaultQueryTimeoutMs: 60_000,
    keepAliveIntervalMs: 20_000,
  });

  sock.ev.on("creds.update", saveCreds);

  const sendText = async (text) => {
    try {
      if (m?.reply) return await m.reply(text);
      if (client?.sendMessage) return await client.sendMessage(client.user.id, { text });
    } catch {}
  };

  // ✅ pairing code con reintentos
  let pairingSent = false;
  let closed = false;

  (async () => {
    if (state.creds.registered) return;
    await sleep(1500);

    for (let i = 1; i <= 3; i++) {
      if (closed) return;
      try {
        const code = await sock.requestPairingCode(String(number));
        pairingSent = true;
        await sendText(
          `🔗 *Código de emparejamiento SubBot*\n` +
            `Número: *${number}*\n` +
            `Código: *${code}*\n\n` +
            `WhatsApp (teléfono): Dispositivos vinculados → Vincular → *Vincular con código*`
        );
        return;
      } catch (e) {
        if (i < 3) await sleep(1500);
      }
    }

    if (!pairingSent) {
      await sendText(
        `⚠️ No se pudo generar el *código* para *${number}*.\n` +
        `Tip: revisa que tu WhatsApp tenga “Vincular con código”.`
      );
    }
  })().catch(() => {});

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update || {};

    if (connection === "open") {
      console.log(`[SubBot ${number}] Connected ✅`);
      return;
    }

    if (connection === "close") {
      closed = true;

      const boom = new Boom(lastDisconnect?.error);
      const code = boom?.output?.statusCode;
      const reason = prettyDisconnect(code);

      console.log(`[SubBot ${number}] Connection closed. Code=${code} Reason=${reason}`);
      console.log(`[SubBot ${number}] lastDisconnect.error =`, lastDisconnect?.error);

      // ✅ cuando se cierre, bórralo del Map
      try { global.subBots.delete(number); } catch {}

      // ✅ si quedó "cerrado", borra la sesión automáticamente (como pediste)
      // Esto evita que quede "session abierta" fantasma y te dé errores después.
      safeRm(sessionPath);

      // Si quieres ser menos agresivo y SOLO borrar en ciertos códigos,
      // cambia esto por un if (loggedOut/badSession/forbidden)
      await sendText(`⚠️ SubBot *${number}* se cerró (Code ${code}: ${reason}). Sesión limpiada.`);

      try { sock.end?.(); } catch {}
      return;
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
