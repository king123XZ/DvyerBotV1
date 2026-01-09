module.exports = {
  command: ['test'], // ahora es un array
  alias: ['prueba'],
  description: 'Comando de prueba para verificar channelInfo',
  async run(conn, m) {
    return conn.reply(
      m.chat,
      '✅ Este es un mensaje de prueba desde el canal!',
      m,
      global.channelInfo
    );
  }
};
