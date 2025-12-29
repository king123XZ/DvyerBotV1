const fs = require("fs");
const path = require("path");

module.exports = {
  command: ["menu", "help", "ayuda"],

  run: async (client, m) => {
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

    // 📂 RUTA ABSOLUTA DEL AUDIO
    const audioPath = path.join(
      __dirname,
      "..",
      "audio",
      "do_u_see_what_happens_when_u_break_your_promises_killua_zoldyck_hxh_h.mp3"
    );

    // 🎧 ENVIAR AUDIO LOCAL
    await client.sendMessage(m.chat, {
      audio: fs.readFileSync(audioPath),
      mimetype: "audio/mpeg",
      ptt: true
    });

    // ⏱ pequeño delay
    await new Promise(r => setTimeout(r, 800));

    // 📹 VIDEO GIF
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

