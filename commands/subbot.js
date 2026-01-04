const { startSubBot } = require("../lib/startSubBot");
const { mainHandler } = require("../main");

module.exports = {
  command: ["subbot"],
  isOwner: true,
  cooldown: 10,

  async run(client, m) {
    const number = m.sender.split("@")[0];

    await m.reply("📲 Generando subbot...");

    const sock = await startSubBot(number, mainHandler);

    const code = await sock.requestPairingCode(number);
    await m.reply(`✅ Código de vinculación:\n\n*${code}*`);
  }
};