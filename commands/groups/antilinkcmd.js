const antilink = require("./antilink")

module.exports = {
  command: ["antilink"],
  categoria: "grupos",
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,

  run: async (client, m, args) => {
    if (!args[0]) {
      return m.reply(
        "📛 *ANTILINK*\n\n" +
        "• `.antilink on`\n" +
        "• `.antilink off`"
      )
    }

    if (args[0] === "on") {
      antilink.setActive(m.chat, true)
      return m.reply("✅ Antilink activado")
    }

    if (args[0] === "off") {
      antilink.setActive(m.chat, false)
      return m.reply("❌ Antilink desactivado")
    }

    m.reply("⚠️ Usa `.antilink on` o `.antilink off`")
  }
}
