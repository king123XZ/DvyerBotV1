const { setHosting, getHosting } = require("../../lib/host");

module.exports = {
  name: "host",
  category: "owner",
  owner: true,

  async execute(client, m, args) {
    if (!args[0]) {
      return m.reply(
        "❌ Uso incorrecto\n\n" +
        "Ejemplo:\n" +
        ".set-host sky\n" +
        ".set-host otro"
      );
    }

    const value = args[0].toLowerCase();

    if (!["sky", "otro"].includes(value)) {
      return m.reply("❌ Opción inválida. Usa: sky | otro");
    }

    const old = getHosting();
    const success = setHosting(value);

    if (!success) {
      return m.reply("❌ No se pudo cambiar el hosting.");
    }

    m.reply(
      `✅ Hosting actualizado correctamente\n\n` +
      `🔁 Antes: *${old.toUpperCase()}*\n` +
      `🌐 Ahora: *${value.toUpperCase()}*`
    );
  }
};
