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
const { exec } = require("child_process");

const mainHandler = require("./main");
const welcome = require("./lib/system/welcome");

// ================= LOGS =================
const log = {
  info: (msg) => console.log(chalk.bgBlue.white.bold("INFO"), chalk.white(msg)),
  success: (msg) => console.log(chalk.bgGreen.white.bold("SUCCESS"), chalk.greenBright(msg)),
  warn: (msg) => console.log(chalk.bgYellow.white.bold("WARN"), chalk.yellow(msg)),
  error: (msg) => console.log(chalk.bgRed.white.bold("ERROR"), chalk.redBright(msg)),
};

const question = (text) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => rl.question(text, (ans) => {
    rl.close();
    resolve(ans.trim());
  }));
};

// ================= START BOT =================
async function startBot(botNumber = process.env.BOT_NUMBER || "main") {
  const sessionPath = path.join(__dirname, "sessions", botNumber);

  if (!fs.existsSync("./sessions")) fs.mkdirSync("./sessions");
  if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath);

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  const client = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    browser: ["DevYerBot", "Chrome", "1.0"],
    auth: state,
  });

  // ===== REGISTRO / EMPAREJAMIENTO =====
  if (!client.authState.creds.registered) {
    const phoneNumber = await question(
      "📱 Ingresa tu número (ej: 51999999999): "
    );

    try {
      log.info("Solicitando código de emparejamiento...");
      const pairingCode = await client.requestPairingCode(phoneNumber);
      log.success(`Código: ${pairingCode} (15s)`);
    } catch (err) {
      log.error("Error al emparejar");
      exec(`rm -rf ${sessionPath}`);
      process.exit(1);
    }
  }

  // ===== DB =====
  await global.loadDatabase();
  log.success("Base de datos cargada");

  // ===== CONEXIÓN =====
  client.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      log.success(`Conectado (${botNumber})`);
    }

    if (connection === "close") {
      const reason = new Boom(lastDisconnect?.error)?.output.statusCode;

      if (
        [
          DisconnectReason.connectionClosed,
          DisconnectReason.connectionLost,
          DisconnectReason.restartRequired,
          DisconnectReason.timedOut,
        ].includes(reason)
      ) {
        log.warn("Reconectando...");
        startBot(botNumber);
        return;
      }

      if (
        [
          DisconnectReason.loggedOut,
          DisconnectReason.forbidden,
          DisconnectReason.badSession,
          DisconnectReason.multideviceMismatch,
        ].includes(reason)
      ) {
        log.error("Sesión inválida, eliminando...");
        exec(`rm -rf ${sessionPath}`);
        process.exit(1);
      }
    }
  });

  // ===== MENSAJES =====
  client.ev.on("messages.upsert", async ({ messages }) => {
    try {
      let m = messages[0];
      if (!m.message) return;

      m.message = m.message.ephemeralMessage?.message || m.message;
      if (m.key.remoteJid === "status@broadcast") return;

      m = smsg(client, m);
      await mainHandler(client, m);
    } catch (e) {
      console.log("❌ Error handler:", e);
    }
  });

  // ===== WELCOME =====
  client.ev.on("group-participants.update", async (update) => {
    try {
      await welcome(client, update);
    } catch (e) {
      console.log("❌ Error welcome:", e);
    }
  });

  // ===== JID =====
  client.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      const decode = jidDecode(jid) || {};
      return decode.user && decode.server
        ? decode.user + "@" + decode.server
        : jid;
    }
    return jid;
  };

  client.ev.on("creds.update", saveCreds);
}

startBot();

// ===== AUTO RELOAD =====
fs.watchFile(__filename, () => {
  console.log(chalk.yellowBright("Archivo actualizado, recargando..."));
  process.exit(0);
});