module.exports = {
  command: ["menu", "help", "ayuda"],
  category: "general",
  description: "Menú profesional con botones por categorías.",

  run: async (client, m) => {

    const sections = [
      {
        title: "⚡ DESCARGAS",
        rows: [
          { title: "ytmp3", rowId: "ytmp3" },
          { title: "ytmp4", rowId: "ytmp4" },
          { title: "play", rowId: "play" },
          { title: "tiktok", rowId: "tiktok" },
          { title: "facebook", rowId: "facebook" }
        ]
      },
      {
        title: "🛠️ UTILIDADES",
        rows: [
          { title: "sticker", rowId: "sticker" },
          { title: "toimg", rowId: "toimg" },
          { title: "hd", rowId: "hd" },
          { title: "qr", rowId: "qr" }
        ]
      },
      {
        title: "📡 INFO BOT",
        rows: [
          { title: "ping", rowId: "ping" },
          { title: "owner", rowId: "owner" },
          { title: "runtime", rowId: "runtime" },
          { title: "estado", rowId: "estado" }
        ]
      }
    ];

    const listMessage = {
      title: "⫷✦ 𝐘𝐞𝐫𝐓𝐗 𝐁𝐎𝐓 - 𝐌𝐄𝐍𝐔 ✦⫸",
      text: `🧬 *Usuario:* ${m.pushName}\n🕶 *Modo:* Hacker Oscuro\n⚙️ *Versión:* 2.5 PRO`,
      footer: "Selecciona una sección del menú.",
      buttonText: "📂 ABRIR MENÚ",
      sections
    };

    await client.sendMessage(m.chat, {
      image: { url: "https://i.ibb.co/XxdTkYNq/menu.png" },
      caption: "👾 *Menú Hacker Oscuro cargado...*",
    });

    await client.sendMessage(m.chat, listMessage);
  }
};
