module.exports = {
  command: ["mfget"],
  category: "downloader",

  run: async (client, m, args) => {
    if (!args[0]) return m.reply("❌ Enlace no válido.");

    await client.sendMessage(
      m.chat,
      {
        text: `
⬇️ *Descarga lista*
━━━━━━━━━━━━━━━
🔗 ${args[0]}

⚠️ Archivo pesado
Descárgalo desde tu navegador

👑 DevYer
        `.trim()
      },
      { quoted: m }
    );
  }
};
