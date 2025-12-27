module.exports = {
  command: ["ttvideo"],
  category: "downloader",

  run: async (client, m) => {
    const data = global.ttCache?.[m.sender];
    if (!data?.video) {
      return m.reply("❌ No hay video en memoria. Usa !tiktok primero.");
    }

    await client.sendMessage(
      m.chat,
      {
        video: { url: data.video },
        mimetype: "video/mp4",
        caption: "🎬 TikTok Video"
      },
      { quoted: m }
    );
  }
};
