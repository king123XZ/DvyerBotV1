const { startSubBot } = require("../lib/startSubBot");

if (!global.subBots) global.subBots = new Map();

async function run(client, m, args, { text, prefix, command }) {
  const mainHandler = global.mainHandler;

  let number =
    (args && args[0] ? String(args[0]) : null) ||
    (m.quoted ? m.quoted.sender.split("@")[0] : null) ||
    (m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0].split("@")[0] : null) ||
    (m.sender ? m.sender.split("@")[0] : null);

  number = (number || "").replace(/\D/g, "");

  try {
    if (typeof mainHandler !== "function") throw new Error("mainHandler no cargado.");
    if (!number) throw new Error("Pon un número. Ej: .subbot 519xxxxxxxx");

    // Si ya existe subbot para ese número, cerrarlo y reemplazarlo
    const old = global.subBots.get(number);
    if (old?.end) {
      try { old.end(); } catch {}
      global.subBots.delete(number);
    }

    const sock = await startSubBot(number, mainHandler, client, m);

    global.subBots.set(number, sock);

    await m.reply(
      `🚀 SubBot iniciando para *${number}*...\n` +
      `Te mandaré el *código* aquí (y también sale en consola).`
    );
  } catch (err) {
    console.error(err);
    await m.reply(`❌ Error: ${err.message}`);
  }
}

module.exports = {
  command: ["subbot", "serbot", "jadibot"],
  run,
};
