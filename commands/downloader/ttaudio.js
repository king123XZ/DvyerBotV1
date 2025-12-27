module.exports = {
  command: ["ttaudio"],
  category: "downloader",

  run: async (client, m) => {
    const data = global.ttCache?.[m.sender];
    if (!data?.music) {
      return m.reply("❌ No hay audio disponible.");
    }

    await client.sendMessage(
      m.chat,
      {
        audio: { url: data.music },
        mimetype: "audio/mpeg",
        ptt: false
      },
      { quoted: m }
    );
  }
};
