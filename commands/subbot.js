const { startSubBot } = require('../lib/startSubBot');
// Aquí cargamos tu archivo main.js
const main = require('../main'); 

async function run(conn, m, { args }) {
  // Identificamos al usuario
  let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender;
  let number = who.split('@')[0];

  try {
    // IMPORTANTE: 'main' contiene la función que exportaste en tu main.js
    // Se la pasamos a startSubBot para que no de el error de "no es función"
    await startSubBot(number, main);
    
    m.reply(`🚀 Generando sub-bot para: ${number}\n\nRevisa la consola para el código de vinculación.`);
  } catch (err) {
    console.error("Error al iniciar subbot:", err);
    m.reply(`❌ Error al iniciar: ${err.message}`);
  }
}

module.exports = {
  command: ["subbot", "serbot", "jadibot"],
  run
};
