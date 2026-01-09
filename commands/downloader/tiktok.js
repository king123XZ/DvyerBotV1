const axios = require("axios");

// ADONIX API
const ADONIX_API = "https://api-adonix.ultraplus.click/download/tiktok";
const ADONIX_KEY = "dvyer";

module.exports = {
  command: ["tiktok", "tt"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      const url = args[0];

      if (!url || !url.startsWith("http")) {
        return m.reply(
          "📌 Ingresa un enlace de TikTok\n\nEjemplo:\n.tiktok https://www.tiktok.com/@user/video/123"
        );
      }

      // ⚡ Aviso rápido
      await m.reply("⏳ Descargando video...");

      // 📡 Llamada a ADONIX
      const res = await axios.post(
        ADONIX_API,
        { url },
        {
          headers: {
            "Content-Type": "application/json",
            apikey: ADONIX_KEY
          },
          timeout: 60000
        }
      );

      if (!res.data || !res.data.status || !res.data.result?.media?.video) {
        throw new Error("Respuesta inválida de ADONIX");
      }

      const videoUrl = res.data.result.media.video;
      const author = res.data.result.author?.name || "Desconocido";
      const title = res.data.result.title || "TikTok Video";

      const caption =
        `🎬 *TikTok*\n` +
        `👤 Autor: ${author}\n` +
        `📝 ${title}`;

      // 🎬 Enviar video (FORMA CORRECTA)
      await client.sendMessage(
        m.chat,
        {
          video: { url: videoUrl },
          mimetype: "video/mp4",
          caption
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("TIKTOK ADONIX ERROR:", err.response?.data || err.message);
      await m.reply("❌ Error al descargar el video.");
    }
  }
};
