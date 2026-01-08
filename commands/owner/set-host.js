 const { setHosting, getHosting } = require("../../lib/host");

function menuText() {
  return (
    `🌐 *CONFIGURACIÓN DE HOSTING*\n\n` +
    `📌 Hosting actual: *${getHosting().toUpperCase()}*\n\n` +
    `Selecciona el alojamiento del bot:\n` +
    `Puedes cambiarlo en cualquier momento.`
  );
}

function menuButtons() {
  return [
    {
      buttonId: ".set-host sky",
      buttonText: { displayText: "☁️ SKY HOSTING" },
      type: 1
    },
    {
      buttonId: ".set-host otro",
      buttonText: { displayText: "🌍 OTRO HOSTING" },
      type: 1
    }
  ];
}

module.exports = {
  command: ["set-host"],
  category: "owner",

  run: async (client, m, args) => {

    // 🔐 PERMISOS
    const botNumber = client.user.id.split(":")[0];
    const sender = m.sender.split("@")[0];

    const isBotNumber = sender === botNumber;
    const isOwner = global.owner.includes(sender);

    if (!isOwner && !isBotNumber) {
      return m.reply("❌ Solo el owner o el número del bot pueden usar este comando.");
    }

    // 👉 Cuando viene desde botón
    if (args[0] === "sky" || args[0] === "otro") {
      const before = getHosting();
      const selected = args[0];

      if (before === selected) {
        return client.sendMessage(
          m.chat,
          {
            text:
              `⚠️ El bot ya está configurado en:\n\n` +
              `🌐 *${before.toUpperCase()}*\n\n` +
              `Selecciona otra opción si deseas cambiar.`,
            buttons: menuButtons(),
            headerType: 1
          },
          { quoted: m }
        );
      }

      const success = setHosting(selected);
      if (!success) {
        return m.reply("❌ Error al guardar el hosting.");
      }

      return client.sendMessage(
        m.chat,
        {
          text:
            `✅ *Hosting actualizado*\n\n` +
            `🔁 Antes: *${before.toUpperCase()}*\n` +
            `🌐 Ahora: *${selected.toUpperCase()}*\n\n` +
            `Puedes cambiarlo nuevamente cuando quieras:`,
          buttons: menuButtons(),
          headerType: 1
        },
        { quoted: m }
      );
    }

    // 👉 Menú inicial
    await client.sendMessage(
      m.chat,
      {
        text: menuText(),
        buttons: menuButtons(),
        headerType: 1
      },
      { quoted: m }
    );
  }
};
