/*************************************************
 * WhatsApp Bot - Pterodactyl / Docker SAFE
 * Node.js 18.x / 20.x LTS
 *************************************************/

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
const mainHandler = require("./main");

// ================= CONFIG =================
const SESSIONS_DIR = path.join(__dirname, "sessions");
const RECONNECT_DELAY = 3000;
let databaseLoaded = false;

// ================= HELPERS =================
const delay = ms => new Promise(r => setTimeout(r, ms));

const safeUser = () =>
  process.env.USER ||
  process.env.USERNAME ||
  "container";

const safeMkdir = dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

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

// ================= BANNER =================
console.log(chalk.yellow("════════════════════════════"));
log.info(`Usuario: ${safeUser()}`);
log.info(`OS: ${os.platform()} ${os.arch()}`);
log.info(`Node: ${process.version}`);
log.info(`RAM Libre: ${(os.freemem() / 1024 / 1024).toFixed(0)} MB`);
log.info(
  `Fecha: ${new Date().toLocaleString("es-PE", {
    timeZone: "America/Lima",
    hour12: false,
  })}`
);
console.log(chalk.yellow("════════════════════════════"));

// ================= START BOT =================
async function startBot(botNumber = process.env.BOT_NUMBER || "main") {
  const sessionPath = path.join(SESSIONS_DIR, botNumber);
  safeMkdir(SESSIONS_DIR);
  safeMkdir(sessionPath);

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  const client = makeWASocket({
    version,
    auth: state,
    browser: ["Linux", "Chrome"],
    printQRInTerminal: false,
    generateHighQualityLinkPreview: false,
    logger: pino({ level: "fatal" }), // 🔥 LOW RAM
  });

  // ========== EMPAREJAMIENTO ==========
  if (!client.authState.creds.registered) {
    const phone = await question("📱 Número WhatsApp (519xxxxxxxx): ");
    try {
      const code = await client.requestPairingCode(phone);
      log.success(`Código de vinculación: ${code}`);
    } catch {
      log.error("No se pudo generar el código");
      clearSession(sessionPath);
      process.exit(1);
    }
  }

  // ========== DATABASE (UNA SOLA VEZ) ==========
  if (!databaseLoaded) {
    await global.loadDatabase();
    databaseLoaded = true;
    log.success("Base de datos cargada");
  }

  // ========== CONNECTION ==========
  client.ev.on("connection.update", async update => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      log.warn(`Desconectado (${reason})`);

      if (
        reason === DisconnectReason.loggedOut ||
        reason === DisconnectReason.forbidden
      ) {
        log.error("Sesión cerrada desde WhatsApp");
        clearSession(sessionPath);
      }

      // 🔥 NO reconectar dentro del proceso
      await delay(RECONNECT_DELAY);
      process.exit(0); // 👉 panel reinicia limpio
    }

    if (connection === "open") {
      log.success(`Bot conectado (${botNumber})`);
    }
  });

  // ========== MESSAGES ==========
  client.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages?.[0];
    if (!m?.message) return;
    if (m.key.remoteJid === "status@broadcast") return;

    try {
      const msg = smsg(client, m);
      if (typeof mainHandler === "function") {
        await mainHandler(client, msg);
      }
    } catch (e) {
      log.error(e.message);
    }
  });

  // ========== WELCOME ==========
  client.ev.on("group-participants.update", async update => {
    try {
      await welcome(client, update);
    } catch {}
  });

  // ========== JID DECODE ==========
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

// ========== AUTO RESTART SAFE ==========
fs.watch(__filename, () => {
  console.log(chalk.yellow("♻ Archivo actualizado, reiniciando..."));
  process.exit(0);
});