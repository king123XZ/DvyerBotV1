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

      // ⚡ Aviso rápido
      await m.reply("⏳ Descargando video...");

      // ✅ MÉTODO CORRECTO: GET
      const res = await axios.get(API_URL, {
        params: {
          url,
          apikey: API_KEY
        },
        timeout: 60000
      });

      if (!res.data?.status || !res.data?.data?.video) {
        console.log("RESPUESTA ADONIX:", res.data);
        throw new Error("Respuesta inválida de ADONIX");
      }

      const videoUrl = res.data.data.video;
      const author = res.data.data.author || "Desconocido";
      const title = res.data.data.title || "TikTok";

      await client.sendMessage(
        m.chat,
        {
          video: { url: videoUrl },
          mimetype: "video/mp4",
          caption: `🎬 TikTok\n👤 ${author}\n📝 ${title}`
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("TIKTOK ADONIX ERROR:", err.response?.data || err.message);
      m.reply("❌ No se pudo descargar el video.");
    }
  }
};

