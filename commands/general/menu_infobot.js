module.exports = {
  command: ["menu_infobot"],

  run: async (client, m) => {
    const text = `
⧼ 𝐈𝐍𝐅𝐎𝐁𝐎𝐓 ⧽

📡 Ping
👤 Owner
⏱ Runtime
📊 Estado
`;

    await client.sendMessage(m.chat, { text });
  }
};
