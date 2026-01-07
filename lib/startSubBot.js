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

// 👇 IMPORTANTE: usa el mismo smsg que tu bot principal.
// En tu index.js principal aparece: const { smsg } = require("./lib/message")
const { smsg } = require("./message"); // si tu ruta real es ../lib/message, cámbiala

if (!global.subBots) global.subBots = new Map();

const SUBBOT_SESS_DIR = path.join(__dirname, "../sessions/subbots");
const RECONNECT_DELAY = 2500;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function safeMkdir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
function clearSession(dir) {
  try {
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}

async function startSubBot(number, mainHandler, parentClient, m, attempt = 0) {
  if (typeof mainHandler !== "function") throw new Error("mainHandler inválido");
  if (!number || !/^[0-9]{7,15}$/.test(String(number))) {
    throw new Error("Número inválido. Ej: 519xxxxxxxx (solo dígitos)");
  }

  safeMkdir(SUBBOT_SESS_DIR);
  const sessionPath = path.join(SUBBOT_SESS_DIR, `subbot-${number}`);
  safeMkdir(sessionPath);

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  // ✅ ESTO ES CLAVE: usa opciones “tipo principal”
  // Si tu principal tiene otras opciones dentro de makeWASocket({...}),
  // cópialas y pégalas aquí también.
  const client = makeWASocket({
    version,
    auth: state,
    browser: ["Ubuntu", "Chrome"],         // <- igual que tu index.js principal
    logger: pino({ level: "fatal" }),
    printQRInTerminal: false,
    syncFullHistory: false,

    // ✅ MUY IMPORTANTE para pairing-code estable (evita cierres raros)
    markOnlineOnConnect: false,
    connectTimeoutMs: 60_000,
    defaultQueryTimeoutMs: 60_000,
    keepAliveIntervalMs: 20_000,

    // ✅ algunas instalaciones requieren esto para pairing code
    // (no rompe si no aplica)
    mobile: false,
  });

  // ✅ evita ENOENT: asegura carpeta antes de escribir creds
  client.ev.on("creds.update", async () => {
    safeMkdir(sessionPath);
    await saveCreds();
  });

  const sendText = async (text) => {
    try {
      if (m?.reply) return await m.reply(text);
      if (parentClient?.sendMessage) return await parentClient.sendMessage(parentClient.user.id, { text });
    } catch {}
  };

  // ✅ PIDE EL CÓDIGO IGUAL QUE EL PRINCIPAL
  // (espera un poco para que no muera el stream)
  (async () => {
    if (state.creds.registered) return;

    await sleep(2000);

    // varios intentos porque a veces WhatsApp manda 515 y se corta
    for (let i = 1; i <= 6; i++) {
      try {
        const code = await client.requestPairingCode(String(number));

        console.log(`[SubBot ${number}] Código de vinculación: ${code}`);

        await sendText(
          `🔗 *Código de vinculación SubBot*\n` +
          `Número: *${number}*\n` +
          `Código: *${code}*\n\n` +
          `En tu WhatsApp (teléfono del número):\n` +
          `Dispositivos vinculados → Vincular un dispositivo → *Vincular con código*`
        );
        return;
      } catch (e) {
        await sleep(1200 + i * 250);
      }
    }

    await sendText(`⚠️ No pude generar el código para *${number}*. Reintenta: *.subbot ${number}*`);
  })().catch(() => {});

  // ✅ Conexión/reconexión (tipo principal, pero sin apagar el proceso)
  client.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "open") {
      console.log(`[SubBot ${number}] Conectado ✅`);
      await sendText(`✅ SubBot *${number}* conectado. Ya funciona como el bot principal.`);
      return;
    }

    if (connection === "close") {
      const boom = new Boom(lastDisconnect?.error);
      const code = boom?.output?.statusCode;

      console.log(`[SubBot ${number}] Connection closed. Code=${code}`);
      console.log(`[SubBot ${number}] lastDisconnect.error =`, lastDisconnect?.error);

      // sesión inválida -> limpiar
      if (
        code === DisconnectReason.loggedOut ||
        code === DisconnectReason.forbidden ||
        code === DisconnectReason.badSession ||
        code === 401
      ) {
        clearSession(sessionPath);
        global.subBots.delete(number);
        await sendText(`🧹 Sesión inválida. Ejecuta otra vez: *.subbot ${number}*`);
        try { client.end?.(); } catch {}
        return;
      }

      // 515 restartRequired -> reconectar
      if (code === DisconnectReason.restartRequired || code === 515) {
        try { client.end?.(); } catch {}
        await sleep(RECONNECT_DELAY);
        return startSubBot(number, mainHandler, parentClient, m, attempt + 1);
      }

      // cierres comunes -> reintentar pocas veces
      if ((code === DisconnectReason.connectionClosed || code === 428) && attempt < 2) {
        try { client.end?.(); } catch {}
        await sleep(RECONNECT_DELAY);
        return startSubBot(number, mainHandler, parentClient, m, attempt + 1);
      }

      global.subBots.delete(number);
      try { client.end?.(); } catch {}
    }
  });

  // ✅ LO MÁS IMPORTANTE: usa el MISMO handler del bot principal
  client.ev.on("messages.upsert", async ({ messages }) => {
    try {
      const msgRaw = messages?.[0];
      if (!msgRaw?.message) return;
      if (msgRaw.key?.remoteJid === "status@broadcast") return;

      const msg = smsg(client, msgRaw);
      await mainHandler(client, msg);
    } catch (e) {
      console.log("❌ SubBot handler error:", e);
    }
  });

  return client;
}

module.exports = { startSubBot };
