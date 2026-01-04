const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  jidDecode,
  delay,
  downloadContentFromMessage
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const fs = require("fs");
const path = require("path");

const mainHandler = require("../main");
const { smsg } = require("./message");

/* ================= UTIL ================= */
function deleteSession(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}

/* ================= SUBBOT ================= */
async function startSubBot(client, m, userNumber) {
  const botId = userNumber.replace(/\D/g, "");
  const authPath = path.join(__dirname, `../sessions/subbot-${botId}`);
  if (!fs.existsSync(authPath)) fs.mkdirSync(authPath, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(authPath);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    auth: state,
    version,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    browser: ["Ubuntu", "Chrome", "20.0.04"]
  });

  /* ========= decodeJid ========= */
  sock.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      const d = jidDecode(jid) || {};
      return d.user && d.server ? `${d.user}@${d.server}` : jid;
    }
    return jid;
  };

  /* ========= downloadMedia ========= */
  sock.downloadMediaMessage = async (msg) => {
    const mime = (msg.msg || msg).mimetype || "";
    const type = msg.mtype
      ? msg.mtype.replace(/Message/gi, "")
      : mime.split("/")[0];

    const stream = await downloadContentFromMessage(msg, type);
    let buffer = Buffer.from([]);

    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
  };

  sock.ev.on("creds.update", saveCreds);

  /* ========= MENSAJES ========= */
  const messageCache = new Set();

  sock.ev.on("messages.upsert", async ({ messages }) => {
    try {
      const msg = messages[0];
      if (!msg?.message || msg.key.fromMe) return;
      if (messageCache.has(msg.key.id)) return;

      messageCache.add(msg.key.id);
      setTimeout(() => messageCache.delete(msg.key.id), 60_000);

      if (!sock.user && sock.authState.creds.me) {
        sock.user = sock.authState.creds.me;
        sock.user.id = sock.decodeJid(sock.user.id);
      }
      if (!sock.user) return;

      const mClean = smsg(sock, msg);
      await mainHandler(sock, mClean);
    } catch (e) {
      console.error("❌ Error SubBot handler:", e);
    }
  });

  /* ========= CONEXIÓN ========= */
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      sock.user = sock.authState.creds.me;
      sock.user.id = sock.decodeJid(sock.user.id);
      console.log(`✅ SubBot conectado: ${sock.user.id}`);
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;

      if (
        reason === DisconnectReason.loggedOut ||
        reason === DisconnectReason.forbidden ||
        reason === DisconnectReason.badSession
      ) {
        console.log(`🗑️ SubBot ${botId} desconectado permanentemente`);
        sock.ev.removeAllListeners();
        sock.ws?.close();
        deleteSession(authPath);
        return;
      }

      console.log(`🔁 Reconectando SubBot ${botId}...`);
      setTimeout(() => startSubBot(client, m, botId), 5000);
    }
  });

  /* ========= VINCULACIÓN ========= */
  if (!sock.authState.creds.registered) {
    await delay(4000);
    try {
      const code = await sock.requestPairingCode(botId);
      await client.sendMessage(m.chat, {
        text: `🔑 *Código SubBot*\n\n📱 ${botId}\n👉 *${code}*`
      });
    } catch {
      await client.sendMessage(m.chat, {
        text: "⚠️ Espera unos segundos antes de pedir otro código."
      });
    }
  }
}

module.exports = { startSubBot };