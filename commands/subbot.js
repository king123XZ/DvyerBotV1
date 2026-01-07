const { startSubBot } = require('../lib/startSubBot');

async function run(conn, m, { args }) {
  const mainHandler = global.mainHandler; // ✅ evita require circular

  let number =
    (args && args[0] ? String(args[0]) : null) ||
    (m.quoted ? m.quoted.sender.split('@')[0] : null) ||
    (m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0].split('@')[0] : null) ||
    m.sender.split('@')[0];

  number = number.replace(/\D/g, '');

  try {
    if (typeof mainHandler !== 'function') {
      throw new Error('La función principal (mainHandler) no se cargó correctamente.');
    }

    await startSubBot(number, mainHandler, conn, m);
    await m.reply(
      `🚀 SubBot listo.\n\nSi aún no está vinculado, te mandé un *código de emparejamiento* para:\n*${number}*`
    );
  } catch (err) {
    console.error(err);
    await m.reply(`❌ Error al iniciar SubBot: ${err.message}`);
  }
}

module.exports = {
  command: ["subbot", "serbot", "jadibot"],
  run
};
