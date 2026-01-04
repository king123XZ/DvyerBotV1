const { startSubBot } = require('../lib/startSubBot');
// Importamos el objeto que contiene la función
const { mainHandler } = require('../main'); 

async function run(conn, m, { args }) {
  let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender;
  let number = who.split('@')[0];

  try {
    // Verificamos que mainHandler exista antes de iniciar
    if (typeof mainHandler !== 'function') {
      throw new Error("La función principal no se cargó correctamente.");
    }

    await startSubBot(number, mainHandler);
    m.reply(`🚀 Iniciando subbot para: ${number}`);

  } catch (err) {
    console.error(err);
    m.reply(`❌ Error: ${err.message}`);
  }
}

module.exports = {
  command: ["subbot", "serbot", "jadibot"],
  run
};
