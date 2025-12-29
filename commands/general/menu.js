const axios = require("axios");

module.exports = {
  command: ["menu", "help", "ayuda"],

  run: async (client, m, { prefix }) => {
    const owners = [
      "51917391317@s.whatsapp.net",
      "51907376960@s.whatsapp.net"
    ];

    const isOwner = owners.includes(m.sender);

    const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat) : {};
    const admins = m.isGroup ? groupMetadata.participants.filter(p => p.admin) : [];
    const isAdmin = admins.some(p => p.id === m.sender);

    if (!isOwner && !isAdmin) {
      return m.reply("🚫 *Este comando solo puede usarlo el OWNER o los ADMINS del grupo.*");
    }

    // 📥 Descargar audio como buffer
    const audioBuffer = await axios.get(
      "https://files.catbox.moe/kbhi15.mp3",
      { responseType: "arraybuffer" }
    );

    // 🎧 Enviar audio (nota de voz)
    await client.sendMessage(m.chat, {
      audio: audioBuffer.data,
      mimetype: "audio/mpeg",
      ptt: true
    });

    await new Promise(r => setTimeout(r, 800));

    // 📹 Video GIF
    await client.sendMessage(m.chat, {
      video: {
        url: "https://files.catbox.moe/2jmexf.mp4"
      },
      gifPlayback: true,
      caption: `⧼KILLUA DV V1.00⧽

👤 Usuario: ${m.pushName}
🏴 Modo: Activo 
🕶️ Versión: v2.0

━━━━━━━━━━━━━━━━━━
👑 *CREADOR: DVYER*`
    });

    const buttons = [
      {
        buttonId: ".menu_descargas",
        buttonText: { displayText: "📥 Descargas" },
        type: 1
      },
      {
        buttonId: ".menu_utilidades",
        buttonText: { displayText: "🛠 Utilidades" },
        type: 1
      },
      {
        buttonId: ".menu_infobot",
        buttonText: { displayText: "🤖 InfoBot" },
        type: 1
      }
    ];

    await client.sendMessage(m.chat, {
      text: "📂 *Selecciona una categoría:*",
      footer: "YerTX Bot • DVYER",
      buttons,
      headerType: 1
    });
  }
};
