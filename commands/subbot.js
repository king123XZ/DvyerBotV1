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
    if (typeof mainHandler !== "function") {
      throw new Error("La función principal (mainHandler) no se cargó correctamente.");
    }

    // Si ya existe un subbot con ese número, lo cerramos antes de iniciar otro
    const old = global.subBots.get(number);
    if (old?.end) {
      try { old.end(); } catch {}
      global.subBots.delete(number);
    }

    const sock = await startSubBot(number, mainHandler, client, m);

    // ✅ lo guardamos para mantener referencia y poder gestionarlo
    global.subBots.set(number, sock);

    await m.reply(
      `🚀 SubBot iniciado para *${number}*.\n` +
      `Si aparece QR/código, te lo enviaré aquí.`
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
