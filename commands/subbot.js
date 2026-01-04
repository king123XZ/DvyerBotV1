const { startSubBot } = require('../lib/startSubBot');
// Importamos el handler directamente desde el main
const mainHandler = require('../main'); 

const run = async (conn, m, { args }) => {
  // Obtenemos el número del usuario que solicitó el subbot
  let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender;
  let number = who.split('@')[0];

  try {
    // IMPORTANTE: Pasamos 'mainHandler' como segundo argumento
    await startSubBot(number, mainHandler);
    m.reply(`🚀 Generando sesión para el subbot: ${number}...`);
  } catch (err) {
    console.error(err);
    m.reply(`❌ Error al iniciar subbot: ${err.message}`);
  }
};

// Ajusta estas propiedades según como maneje los comandos tu bot
module.exports = { 
    run,
    name: "subbot",
    alias: ["serbot"],
    isGroup: false
};
