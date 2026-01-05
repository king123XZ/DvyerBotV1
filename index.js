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
const { Boom } = require("@hapi/boom");

const { smsg } = require("./lib/message");
const welcome = require("./lib/system/welcome");

// ⚠️ ASEGÚRATE que main.js exporte una función
const mainHandler = require("./main");

// ================== CONFIG ==================
const SESSIONS_DIR = path.join(__dirname, "sessions");
const RECONNECT_DELAY = 3000;
let reconnecting = false;

// ================== HELPERS ==================
const delay = ms => new Promise(r => setTimeout(r, ms));

const clearSession = dir => {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
};

const question = text => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve =>
    rl.question(text, ans => {
      rl.close();
      resolve(ans.trim());
    })
  );
};

const log = {
  info: msg => console.log(chalk.bgBlue.white(" INFO "), msg),
  success: msg => console.log(chalk.bgGreen.white(" OK "), msg),
  warn: msg => console.log(chalk.bgYellow.black(" WARN "), msg),
  error: msg => console.log(chalk.bgRed.white(" ERROR "), msg),
};

// ================== BANNER ==================
console.log(chalk.yellow.bold("════════════════════════════"));
log.info(`Usuario: ${os.userInfo().username}`);
log.info(`Sistema: ${os.platform()} ${os.arch()}`);
log.info(`Node: ${process.version}`);
log.info(`RAM Libre: ${(os.freemem() / 1024 / 1024).toFixed(0)} MB`);
log.info(
  `Fecha: ${new Date().toLocaleString("es-PE", {
    timeZone: "America/Lima",
    hour12: false,
  })}`
);
console.log(chalk.yellow.bold("════════════════════════════"));

// ================== START BOT ==================
async function startBot(botNumber = "main") {
  const sessionPath = path.join(SESSIONS_DIR, botNumber);
  if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR);
  if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath);

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  const client = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    browser: ["Linux", "Chrome"],
    logger: pino({ level: "silent" }), // 👈 menos RAM
    generateHighQualityLinkPreview: false,
  });

  // ===== EMPAREJAMIENTO =====
  if (!client.authState.creds.registered) {
    const phone = await question("📱 Número WhatsApp (519xxxxxxxx): ");
    try {
      const code = await client.requestPairingCode(phone);
      log.success(`Código de vinculación: ${code}`);
    } catch (e) {
      log.error("No se pudo generar el código");
      clearSession(sessionPath);
      process.exit(1);
    }
  }

  // ===== DATABASE =====
  await global.loadDatabase();
  log.success("Base de datos cargada");

  // ===== CONEXIÓN =====
  client.ev.on("connection.update", async update => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;

      if (reconnecting) return;
      reconnecting = true;

      log.warn(`Desconectado (${reason})`);

      if (
        reason === DisconnectReason.loggedOut ||
        reason === DisconnectReason.forbidden
      ) {
        log.error("Sesión cerrada desde WhatsApp");
        clearSession(sessionPath);
        process.exit(1);
      }

      if (reason === DisconnectReason.badSession) {
        log.warn("Bad session detectada, limpiando...");
        clearSession(sessionPath);
      }

      await delay(RECONNECT_DELAY);
      reconnecting = false;
      startBot(botNumber);
    }

    if (connection === "open") {
      reconnecting = false;
      log.success(`Bot conectado (${botNumber})`);
    }
  });

  // ===== MENSAJES =====
  client.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages?.[0];
    if (!m?.message) return;
    if (m.key.remoteJid === "status@broadcast") return;

    try {
      const msg = smsg(client, m);
      if (typeof mainHandler !== "function") {
        throw new Error("mainHandler no es una función");
      }
      await mainHandler(client, msg);
    } catch (e) {
      log.error(e.message);
    }
  });

  // ===== WELCOME =====
  client.ev.on("group-participants.update", async update => {
    try {
      await welcome(client, update);
    } catch {}
  });

  // ===== DECODE JID =====
  client.decodeJid = jid => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      const d = jidDecode(jid) || {};
      return d.user && d.server ? `${d.user}@${d.server}` : jid;
    }
    return jid;
  };

  client.ev.on("creds.update", saveCreds);
}

startBot();

// ================= AUTO RELOAD =================
fs.watch(__filename, () => {
  console.log(chalk.yellow("♻ Código actualizado, reiniciando..."));
  process.exit(0);
});