const { startSubBot } = require('../lib/startSubBot');

// main.js exporta la función directamente (module.exports = mainHandler)
const mainHandler = require('../main');

async function run(conn, m, { args }) {
  // Permite: .subbot 519xxxxxxxx
  let number =
    (args && args[0] ? String(args[0]) : null) ||
    (m.quoted ? m.quoted.sender.split('@')[0] : null) ||
    (m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0].split('@')[0] : null) ||
    m.sender.split('@')[0];

  // Solo dígitos
  number = number.replace(/\D/g, '');

  try {
    if (typeof mainHandler !== 'function') {
      throw new Error('La función principal (mainHandler) no se cargó correctamente.');
    }

    await startSubBot(number, mainHandler, conn, m);
    await m.reply(`🚀 SubBot listo. Si aún no está vinculado, te mandé un *código de emparejamiento* para: ${number}`);
  } catch (err) {
    console.error(err);
    await m.reply(`❌ Error al iniciar SubBot: ${err.message}`);
  }
}

module.exports = {
  command: ["subbot", "serbot", "jadibot"],
  run
};
