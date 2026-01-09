// test.js
module.exports = {
  name: 'test',
  alias: ['prueba'],
  desc: 'Comando de prueba para verificar channelInfo',
  async execute(conn, m) {
    // Mensaje de prueba con channelInfo
    return conn.reply(
      m.chat,
      '✅ Este es un mensaje de prueba desde el canal!',
      m,
      global.channelInfo
    );
  }
};


