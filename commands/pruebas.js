// test.js
const fs = require("fs");

module.exports = {
  command: 'test', // comando principal
  alias: ['prueba'], // alias opcional
  description: 'Comando de prueba para verificar channelInfo',
  async run(conn, m) {
    // Respuesta usando channelInfo
    return conn.reply(
      m.chat,
      '✅ Este es un mensaje de prueba desde el canal!',
      m,
      global.channelInfo
    );
  }
};
