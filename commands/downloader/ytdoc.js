const axios = require("axios");

// 🤖 Bot
const BOT_NAME = "KILLUA-BOT v1.00";

// API Gawrgura
const GAW_API = "https://gawrgura-api.onrender.com/download/ytdl";

module.exports = {
  command: ["ytdoc"],
  category: "downloader",
  description: "Descarga video de YouTube como documento",

  run: async (client, m, args) => {
    try {
      const url = args[0];
      if (!url || !url.startsWith("http")) {
        return m.reply("❌ Usa:\n.ytdoc <link de YouTube>");
      }

      // Mensaje de aviso
      await client.sendMessage(
        m.chat,
        { text: `⏳ Descargando video...\n🤖 ${BOT_NAME}` },
        { quoted: m }
      );

      // Llamar API
      const res = await axios.get(`${GAW_API}?url=${encodeURIComponent(url)}`, { timeout: 60000 });
      const result = res.data?.result;

      if (!result || !result.mp4) {
        return m.reply("❌ Error al obtener el video de YouTube.");
      }

      const safeTitle = (result.title || "video").replace(/[\\/:*?"<>|]/g, "").trim();

      // Enviar video como documento
      await client.sendMessage(
        m.chat,
        {
          document: { url: result.mp4 },
          mimetype: "video/mp4",
          fileName: `${safeTitle}.mp4`,
          caption: `🎬 ${result.title}\n✅ API: Gawrgura\n🤖 ${BOT_NAME}`
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("YTDOC ERROR:", err.response?.data || err.message);
      m.reply("❌ Error al descargar el video.");
    }
  }
};

