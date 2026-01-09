const axios = require("axios");

const API_URL = "https://api-adonix.ultraplus.click/download/tiktok";
const API_KEY = "dvyer";

module.exports = {
  command: ["tiktok", "tt"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      const url = args[0];

      if (!url || !url.startsWith("http")) {
        return m.reply(
          "📌 Usa:\n.tiktok https://www.tiktok.com/@user/video/123"
        );
      }

      await m.reply("⏳ Descargando video...");

      const res = await axios.post(
        API_URL,
        { url },
        {
          headers: {
            "Content-Type": "application/json",
            apikey: API_KEY
          },
          timeout: 60000
        }
      );

      if (!res.data?.status || !res.data?.result?.media?.video) {
        throw new Error("Respuesta inválida de ADONIX");
      }

      const videoUrl = res.data.result.media.video;
      const author = res.data.result.author?.name || "Desconocido";
      const title = res.data.result.title || "TikTok";

      await client.sendMessage(
        m.chat,
        {
          video: { url: videoUrl },
          mimetype: "video/mp4",
          caption: `🎬 TikTok\n👤 ${author}\n📝 ${title}`
        },
        { quoted: m }
      );

    } catch (e) {
      console.error("TIKTOK ERROR:", e.response?.data || e.message);
      m.reply("❌ No se pudo descargar el video.");
    }
  }
};
