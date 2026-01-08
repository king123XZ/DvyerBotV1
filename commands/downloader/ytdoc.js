const axios = require("axios");

// 🟢 ADONIX
const ADONIX_API = "https://api-adonix.ultraplus.click/download/ytvideo";
const ADONIX_KEY = "dvyer";

// 🤖 Bot
const BOT_NAME = "KILLUA-BOT v1.00";

module.exports = {
  command: ["ytdoc"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      const url = args[0];
      if (!url || !url.startsWith("http")) {
        return m.reply("❌ Usa:\n.ytdoc <link de YouTube>");
      }

      // ⚡ MENSAJE INMEDIATO (NO ESPERA)
      await client.sendMessage(
        m.chat,
        {
          text:
            `⏳ *Descargando video...*\n` +
            `📺 Calidad predeterminada\n` +
            `✅ API: ADONIX\n` +
            `🤖 ${BOT_NAME}`
        },
        { quoted: m }
      );

      // 🚀 LLAMADA A ADONIX
      const res = await axios.get(
        `${ADONIX_API}?url=${encodeURIComponent(url)}&apikey=${ADONIX_KEY}`,
        { timeout: 30000 }
      );

      if (!res.data?.status || !res.data?.data?.url) {
        throw new Error("Respuesta inválida de ADONIX");
      }

      const fileUrl = res.data.data.url;
      const title = (res.data.data.title || "video")
        .replace(/[\\/:*?"<>|]/g, "")
        .trim();

      // 📤 ENVÍO DEL VIDEO
      await client.sendMessage(
        m.chat,
        {
          video: { url: fileUrl },
          mimetype: "video/mp4",
          caption:
            `🎬 ${title}\n` +
            `✅ API: ADONIX\n` +
            `🤖 ${BOT_NAME}`
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("YTDOC ADONIX ERROR:", err.response?.data || err.message);
      m.reply(
        "❌ No se pudo descargar el video.\n" +
        "⚠️ Puede estar muy largo o la API no respondió."
      );
    }
  }
};
