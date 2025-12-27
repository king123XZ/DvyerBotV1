module.exports = {
  command: ["mfget"],
  category: "downloader",

  run: async (client, m, args) => {
    if (!args[0]) {
      return m.reply("❌ Enlace no válido.");
    }

    const link = args[0];

    await client.sendMessage(
      m.chat,
      {
        text: `
⬇️ *Descarga lista*
━━━━━━━━━━━━━━━
🔗 Enlace:
${link}

⚠️ *Archivo pesado*
Descárgalo desde tu navegador.

👑 Creador: DevYer
        `.trim()
      },
      { quoted: m }
    );
  }
};
