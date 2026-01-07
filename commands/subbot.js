const { startSubBot } = require("../lib/startSubBot");

async function run(client, m, args, { text, prefix, command }) {
  const mainHandler = global.mainHandler; // ✅ no require('../main')

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

    await startSubBot(number, mainHandler, client, m);

    await m.reply(
      `🚀 SubBot iniciado.\n\nSi aún no está vinculado, te enviaré el *código de emparejamiento* para:\n*${number}*`
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
