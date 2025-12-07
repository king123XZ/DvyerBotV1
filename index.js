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

// ----------------------
// NÚMEROS AUTORIZADOS (como bots)
// ----------------------
const authorizedNumbers = [
  "51907376960", // Número 1
  "51917391317"  // Número 2
];

// ----------------------
// Función para iniciar un bot por número
// ----------------------
async function startBot(number) {
  const sessionFolder = `./lurus_session_${number}`;
  const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
  const { version } = await fetchLatestBaileysVersion();

  const client = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    browser: ["Linux", "Opera"],
    auth: state,
  });

  // Conexión
  client.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
      if ([DisconnectReason.connectionLost, DisconnectReason.connectionClosed, DisconnectReason.restartRequired, DisconnectReason.timedOut, DisconnectReason.badSession].includes(reason)) {
        console.log(chalk.yellow(`Reconectando bot ${number}...`));
        startBot(number);
        return;
      }
      if ([DisconnectReason.loggedOut, DisconnectReason.forbidden, DisconnectReason.multideviceMismatch].includes(reason)) {
        console.log(chalk.red(`Bot ${number} cerrado. Eliminar sesión y volver a escanear`));
        exec(`rm -rf ${sessionFolder}/*`);
        process.exit(1);
      }
      client.end(`Motivo desconocido: ${reason}`);
    }
    if (connection === "open") console.log(chalk.green(`Bot ${number} conectado correctamente`));
  });

  // Actualizar credenciales
  client.ev.on("creds.update", saveCreds);

  // Cargar DB
  await global.loadDatabase();

  // Mensajes
  client.ev.on("messages.upsert", async ({ messages }) => {
    try {
      let m = messages[0];
      if (!m.message) return;

      m.message = m.message.ephemeralMessage?.message || m.message;
      if (m.key.remoteJid === "status@broadcast") return;

      m = smsg(client, m);

      // Solo usuarios autorizados pueden ejecutar comandos
      if (!authorizedNumbers.includes(m.sender.split("@")[0])) return;

      await mainHandler(client, m);

    } catch (err) {
      console.log("Error en handler:", err);
    }
  });

  client.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      const decode = jidDecode(jid) || {};
      return decode.user && decode.server ? decode.user + "@" + decode.server : jid;
    }
    return jid;
  };
}

// ----------------------
// Iniciar todos los bots autorizados
// ----------------------
for (const number of authorizedNumbers) {
  startBot(number);
}

// ----------------------
// Auto-reload
// ----------------------
let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.yellowBright(`Se actualizó ${__filename}`));
  delete require.cache[file];
  require(file);
});
