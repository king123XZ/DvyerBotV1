const { setHosting, getHosting } = require("../../lib/host");

module.exports = {
  command: ["set-host", "sethosting"],
  category: "owner",
  owner: true,

  run: async (client, m, args) => {
    if (!args[0]) {
      return m.reply(
        "❌ Usa el comando así:\n\n" +
        ".set-host sky\n" +
        ".set-host otro"
      );
    }

    const newHost = args[0].toLowerCase();
    const before = getHosting().toUpperCase();

    const success = setHosting(newHost);
    if (!success) {
      return m.reply("❌ Error al guardar el hosting.");
    }

    m.reply(
      `✅ Hosting actualizado correctamente\n` +
      `🔁 Antes: ${before}\n` +
      `🌐 Ahora: ${newHost.toUpperCase()}`
    );
  }
};
