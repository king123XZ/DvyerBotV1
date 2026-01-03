const { startSubBot } = require("../lib/startSubBot")

module.exports = {
  command: ["subbot"],
  isOwner: true,

  run: async (client, m) => {
    const botId = `subbot-${Date.now()}`
    await m.reply("⏳ Creando sub-bot…")

    await startSubBot(m.sender, botId)

    await m.reply("📲 Revisa tu WhatsApp, te envié el código.")
  }
}