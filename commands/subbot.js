const { startSubBot } = require('../lib/startSubBot');
// Importamos el archivo principal completo
const main = require('../main'); 

async function run(conn, m, { args }) {
  // Obtenemos el número del usuario
  let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender;
  let number = who.split('@')[0];

  try {
    // Aquí está el truco: 
    // Si 'main' es un objeto que contiene 'mainHandler', usamos ese.
    // Si no, usamos 'main' directamente.
    const handler = typeof main === 'function' ? main : main.mainHandler;

    if (typeof handler !== 'function') {
        throw new Error("No se pudo cargar la función principal del bot.");
    }

    await startSubBot(number, handler);
    m.reply(`🚀 Iniciando subbot para: ${number}\n\nRevisa la consola para el código de vinculación.`);
    
  } catch (err) {
    console.error("Error en comando subbot:", err);
    m.reply(`❌ Error: ${err.message}`);
  }
}

module.exports = {
  command: ["subbot", "serbot", "jadibot"],
  run
};
