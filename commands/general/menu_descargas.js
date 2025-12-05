module.exports = {
  command: ["menu_descargas"],

  run: async (client, m) => {
    const text = `
⧼ 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀𝐒 ⧽

🎵 YouTube MP3
🎬 YouTube MP4
🎶 Play música
🎵 TikTok
🌐 Facebook
`;

    await client.sendMessage(m.chat, { text });
  }
};
