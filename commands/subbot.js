const { createSubBot } = require("../lib/subBotManager")
const handler = require("../main")

module.exports = {
  command: ["subbot"],
  category: "owner",
  isOwner: true,

  run: async (client, m) => {
    await m.reply("⏳ Creando sub-bot…")

    await createSubBot(m.sender, handler)

    await m.reply("📲 Te envié el código para vincular tu WhatsApp.")
  }
}