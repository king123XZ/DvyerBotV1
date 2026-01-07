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
    if (!number) throw new Error("Usa: .subbot 519xxxxxxxx");

    // si ya había uno, lo cerramos
    const old = global.subBots.get(number);
    if (old?.end) {
      try { old.end(); } catch {}
      global.subBots.delete(number);
    }

    const sock = await startSubBot(number, mainHandler, client, m);
    global.subBots.set(number, sock);

    await m.reply(
      `🚀 SubBot iniciando para *${number}*...\n` +
      `Te enviaré el *código de vinculación* aquí y también saldrá en la consola.`
    );
  } catch (e) {
    console.error(e);
    await m.reply(`❌ Error: ${e.message}`);
  }
}

module.exports = {
  command: ["subbot", "serbot", "jadibot"],
  run,
};

