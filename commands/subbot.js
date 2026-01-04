const { startSubBot } = require('../lib/startSubBot');
// Importamos el handler directamente del archivo principal
const mainHandler = require('../main'); 

async function run(conn, m, { args }) {
  // Determinamos el número para la sesión
  let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender;
  let number = who.split('@')[0];

  try {
    // IMPORTANTE: Pasamos el mainHandler para que el subbot sepa responder
    await startSubBot(number, mainHandler);
    m.reply(`🚀 Generando sesión para el subbot: ${number}...\n\nRevisa la consola para el código si es necesario.`);
  } catch (err) {
    console.error("Error en comando subbot:", err);
    m.reply(`❌ Error al iniciar: ${err.message}`);
  }
}

module.exports = {
  command: ["subbot", "serbot", "jadibot"], // Formato que pediste
  run
};
