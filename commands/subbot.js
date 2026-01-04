const { startSubBot } = require('../lib/startSubBot');
// IMPORTANTE: Importamos el handler principal para que el subbot sepa qué hacer
const { handler } = require('../main'); 

// ... (dentro de tu comando)
const run = async (conn, m, { args, text }) => {
  let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
  let number = who.split('@')[0];

  try {
    // PASAMOS EL 'handler' COMO SEGUNDO ARGUMENTO
    await startSubBot(number, handler, conn, m);
    m.reply(`🚀 Iniciando subbot para: ${number}`);
  } catch (err) {
    m.reply(`❌ Error al iniciar: ${err.message}`);
  }
};

module.exports = { run };
