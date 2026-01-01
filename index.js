
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
const qrcode = require("qrcode-terminal");
const parsePhoneNumber = require("awesome-phonenumber");
const { smsg } = require("./lib/message");
const { Boom } = require("@hapi/boom");
const { exec } = require("child_process");

const mainHandler = require("./main");
const welcome = require("./lib/system/welcome");

// ================= LOGS =================
const print = (label, value) =>
  console.log(
    `${chalk.green.bold("║")} ${chalk.cyan.bold(label.padEnd(16))}${chalk.magenta.bold(":")} ${value}`
  );

const question = (text) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(text, (ans) => {
      rl.close();
      resolve(ans.trim());
    })
  );
};

const log = {
  info: (msg) => console.log(chalk.bgBlue.white.bold("INFO"), chalk.white(msg)),
  success: (msg) => console.log(chalk.bgGreen.white.bold("SUCCESS"), chalk.greenBright(msg)),
  warn: (msg) => console.log(chalk.bgYellowBright.blueBright.bold("WARNING"), chalk.yellow(msg)),
  warning: (msg) => console.log(chalk.bgYellowBright.red.bold("WARNING"), chalk.yellow(msg)),
  error: (msg) => console.log(chalk.bgRed.white.bold("ERROR"), chalk.redBright(msg)),
};

// ============== INFO SISTEMA ==============
const userInfoSyt = () => {
  try {
    return os.userInfo().username;
  } catch {
    return process.env.USER || process.env.USERNAME || "desconocido";
  }
};

// ================= BANNER =================
console.log(
  chalk.yellow.bold(
    `╔═════[${chalk.yellowBright(userInfoSyt())}${chalk.white.bold("@")}${chalk.yellowBright(
      os.hostname()
    )}]═════`
  )
);
print("OS", `${os.platform()} ${os.release()} ${os.arch()}`);
print(
  "Actividad",
  `${Math.floor(os.uptime() / 3600)} h ${Math.floor((os.uptime() % 3600) / 60)} m`
);
print("Shell", process.env.SHELL || process.env.COMSPEC || "desconocido");
print("CPU", os.cpus()[0]?.model.trim() || "unknown");
print(
  "Memoria",
  `${(os.freemem() / 1024 / 1024).toFixed(0)} MiB / ${(os.totalmem() / 1024 / 1024).toFixed(0)} MiB`
);
print("Script version", `v${require("./package.json").version}`);
print("Node.js", process.version);
print("Baileys", `WhiskeySockets/baileys`);
print(
  "Fecha & Tiempo",
  new Date().toLocaleString("en-US", {
    timeZone: "America/Mexico_City",
    hour12: false,
  })
);
console.log(chalk.yellow.bold("╚" + "═".repeat(30)));

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
    browser: ["Linux", "Opera"],
    auth: state,
  });

  // ===== REGISTRO =====
  if (!client.authState.creds.registered) {
    const phoneNumber = await question(
      log.warn("Ingrese su número de WhatsApp\n") +
        log.info("Ejemplo: 51999999999\n")
    );

    try {
      log.info("Solicitando código de emparejamiento...");
      const pairing = await client.requestPairingCode(phoneNumber, "DVYER102");
      log.success(`Código de emparejamiento: ${chalk.cyanBright(pairing)} (15s)`);
    } catch (err) {
      log.error("Error al solicitar el código");
      exec(`rm -rf ${sessionPath}`);
      process.exit(1);
    }
  }

  // ===== DB =====
  await global.loadDatabase();
  console.log(chalk.yellow("Base de datos cargada correctamente."));

  // ===== CONEXIÓN =====
  client.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const reason = new Boom(lastDisconnect?.error)?.output.statusCode;

      if (
        [
          DisconnectReason.connectionLost,
          DisconnectReason.connectionClosed,
          DisconnectReason.restartRequired,
          DisconnectReason.timedOut,
        ].includes(reason)
      ) {
        log.warning("Reconectando...");
        startBot(botNumber);
        return;
      }

      if (
        [
          DisconnectReason.loggedOut,
          DisconnectReason.forbidden,
          DisconnectReason.multideviceMismatch,
          DisconnectReason.badSession,
        ].includes(reason)
      ) {
        log.error("Sesión inválida, borra y vuelve a vincular");
        exec(`rm -rf ${sessionPath}`);
        process.exit(1);
      }

      client.end(`Motivo desconocido: ${reason}`);
    }

    if (connection === "open") {
      log.success(`Conectado correctamente (${botNumber})`);
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
    } catch (err) {
      console.log("Error en handler:", err);
    }
  });

  // ===== WELCOME / DESPEDIDA =====
  client.ev.on("group-participants.update", async (update) => {
    try {
      await welcome(client, update);
    } catch (e) {
      console.log("❌ Error welcome:", e);
    }
  });

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
let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.yellowBright(`Se actualizó ${__filename}`));
  delete require.cache[file];
  require(file);
});