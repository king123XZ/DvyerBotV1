const fs = require("fs");
const path = require("path");
const { startSubBot } = require("../lib/startSubBot");

if (!global.subBots) global.subBots = new Map();

const SUBBOT_SESS_DIR = path.join(__dirname, "../sessions/subbots");

function safeRm(dir) {
  try {
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}

async function run(client, m, args, { text, prefix, command }) {
  const mainHandler = global.mainHandler;

  let number =
    (args && args[0] ? String(args[0]) : null) ||
    (m.quoted ? m.quoted.sender.split("@")[0] : null) ||
    (m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0].split("@")[0] : null) ||
    (m.sender ? m.sender.split("@")[0] : null);

  number = (number || "").replace(/\D/g, "");

  try {
    if (typeof mainHandler !== "function") {
      throw new Error("La función principal (mainHandler) no se cargó correctamente.");
    }
    if (!number) throw new Error("Pon un número. Ej: .subbot 519xxxxxxxx");

    // ✅ Si existe un subbot previo, cerrarlo y limpiar
    const old = global.subBots.get(number);
    if (old) {
      try { old.end?.(); } catch {}
      global.subBots.delete(number);

      // borra sesión anterior para evitar sesiones a medias/corruptas
      const oldSessionPath = path.join(SUBBOT_SESS_DIR, `subbot-${number}`);
      safeRm(oldSessionPath);
    }

    const sock = await startSubBot(number, mainHandler, client, m);

    // ✅ guardar referencia del subbot
    global.subBots.set(number, sock);

    await m.reply(
      `🚀 SubBot iniciado para *${number}*.\n` +
      `Si existe sesión vieja, ya fue limpiada automáticamente.`
    );
  } catch (err) {
    console.error(err);
    await m.reply(`❌ Error al iniciar SubBot: ${err.message}`);
  }
}

module.exports = {
  command: ["subbot", "serbot", "jadibot"],
  run,
};
