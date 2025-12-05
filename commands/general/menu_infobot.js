module.exports = {
  command: ["menu_infobot"],
  description: "Muestra la información del bot",
  run: async (client, m) => {

    const text = `
⧼ 𝐘𝐞𝐫𝐓𝐗 𝐁𝐎𝐓 - 𝗜𝗡𝗙𝗢𝗕𝗢𝗧 ⧽
──────────────────────────────

🤖 Información del bot:

• ping → Latencia del bot
• owner → Info del creador
• runtime → Tiempo de actividad
• estado → Estado actual del bot

──────────────────────────────
🔹 Usa los botones para moverte entre secciones.
`;

    const buttons = [
      { buttonId: ".menu_descargas", buttonText: { displayText: "📥 Descargas" }, type: 1 },
      { buttonId: ".menu_utilidades", buttonText: { displayText: "🛠 Utilidades" }, type: 1 },
      { buttonId: ".menu", buttonText: { displayText: "🏠 Menú Principal" }, type: 1 }
    ];

    await client.sendMessage(m.chat, {
      text,
      footer: "YerTX Bot",
      buttons,
      headerType: 1
    });
  }
};
