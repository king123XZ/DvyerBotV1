require("./settings");
require("./lib/database");

const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  jidDecode,
  DisconnectReason,
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const os = require("os");
const { smsg } = require("./lib/message");
const { Boom } = require("@hapi/boom");

const mainHandler = require("./main");
const welcome = require("./lib/system/welcome");

/* ================= ANTI CRASH ================= */
process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

/* ================= LOG ================= */
const log = {
  info: (m) => console.log(chalk.blue("[INFO]"), m),
  warn: (m) => console.log(chalk.yellow("[WARN]"), m),
  error: (m) => console.log(chalk.red("[ERROR]"), m),
  success: (m) => console.log(chalk.green("[OK]"), m),
};

/* ================= UTILS ================= */
function destroySession(botNumber, client) {
  const dir = path.join(__dirname, "sessions", botNumber);
  try {
    client?.ev?.removeAllListeners();
    client?.ws?.close();
  } catch {}
  try {
    fs.rmSync(dir, { recursive: true, force: true });
    log.warn(`🗑️ Sesión eliminada: ${botNumber}`);
  } catch {}
}

/* ================= START BOT ================= */
async function startBot(botNumber = "main") {
  const sessionDir = path.join(__dirname, "sessions", botNumber);
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version } = await fetchLatestBaileysVersion();

  const client = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    browser: ["Linux", "Chrome", "3.0"],
    auth: state,
  });

  /* ===== VINCULACIÓN AUTOMÁTICA ===== */
  if (!client.authState.creds.registered) {
    try {
      await new Promise((r) => setTimeout(r, 3000));
      const code = await client.requestPairingCode(botNumber);
      console.log(chalk.green(`📲 Código ${botNumber}: ${code}`));
    } catch {
      destroySession(botNumber, client);
      return;
    }
  }

  /* ===== DB ===== */
  await global.loadDatabase();
  setInterval(() => global.db.write(), 30_000);

  /* ===== CONEXIÓN ===== */
  client.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "open") {
      log.success(`Conectado: ${botNumber}`);
    }

    if (connection === "close") {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;

      if (
        reason === DisconnectReason.loggedOut ||
        reason === DisconnectReason.forbidden ||
        reason === DisconnectReason.badSession
      ) {
        log.error(`Sesión inválida: ${botNumber}`);
        destroySession(botNumber, client);
        if (botNumber === "main") process.exit(1);
        return;
      }

      log.warn(`Reconectando ${botNumber}`);
      startBot(botNumber);
    }
  });

  /* ===== MENSAJES ===== */
  const cache = new Set();

  client.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0];
    if (!m?.message || cache.has(m.key.id)) return;

    cache.add(m.key.id);
    setTimeout(() => cache.delete(m.key.id), 60_000);

    try {
      const msg = smsg(client, m);
      await mainHandler(client, msg);
    } catch (e) {
      console.log(e);
    }
  });

  /* ===== WELCOME ===== */
  client.ev.on("group-participants.update", async (u) => {
    try {
      await welcome(client, u);
    } catch {}
  });

  client.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      const d = jidDecode(jid) || {};
      return d.user && d.server ? `${d.user}@${d.server}` : jid;
    }
    return jid;
  };

  client.ev.on("creds.update", saveCreds);
}

module.exports = { startBot };

/* ===== START MAIN ===== */
startBot();