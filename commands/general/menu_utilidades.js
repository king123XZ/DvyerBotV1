module.exports = {
  command: ["menu_utilidades"],

  run: async (client, m) => {
    const text = `
⧼ 𝐔𝐓𝐈𝐋𝐈𝐃𝐀𝐃𝐄𝐒 ⧽

🖼 Sticker
📸 ToImg
📺 HD
🔗 QR
`;

    await client.sendMessage(m.chat, { text });
  }
};
