const axios = require("axios");

// APIs
const SEARCH_API = "https://gawrgura-api.onrender.com/search/tiktok";
const DOWNLOAD_API = "https://gawrgura-api.onrender.com/download/tiktok";

// BOT
const BOT_NAME = "KILLUA-BOT v1.00";

module.exports = {
  command: ["tiktok", "tt"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      const input = args.join(" ");

      if (!input) {
        return client.reply(
          m.chat,
          "❌ Escribe un texto o pega un enlace de TikTok.\n" +
          "Ejemplo:\n" +
          ".tiktok goku\n" +
          ".tiktok https://tiktok.com/...",
          m,
          global.channelInfo
        );
      }

      // ⏳ UX
      await client.reply(
        m.chat,
        `⏳ *Procesando TikTok...*\n🤖 ${BOT_NAME}`,
        m,
        global.channelInfo
      );

      let videoUrl;
      let title = "tiktok";

      // 🔗 SI ES LINK DE TIKTOK
      if (/tiktok\.com/.test(input)) {

        const res = await axios.get(
          `${DOWNLOAD_API}?url=${encodeURIComponent(input)}`,
          { timeout: 120000 }
        );

        const data = res.data?.result;
        if (!data?.play) {
          throw new Error("Descarga TikTok inválida");
        }

        videoUrl = data.play;
        title = data.title || title;

      } 
      // 🔎 SI ES BÚSQUEDA
      else {
        const res = await axios.get(
          `${SEARCH_API}?q=${encodeURIComponent(input)}`,
          { timeout: 60000 }
        );

        const results = res.data?.result;
        if (!Array.isArray(results) || results.length === 0) {
          return client.reply(
            m.chat,
            "❌ No se encontraron resultados.",
            m,
            global.channelInfo
          );
        }

        const video = results[0];
        videoUrl = video.play;
        title = video.title || title;
      }

      // 🧼 Limpiar nombre
      title = title.replace(/[\\/:*?"<>|]/g, "").slice(0, 60);

      // 🎥 Enviar video
      await client.sendMessage(
        m.chat,
        {
          video: { url: videoUrl },
          mimetype: "video/mp4",
          fileName: `${title}.mp4`
        },
        { quoted: m, ...global.channelInfo }
      );

    } catch (err) {
      console.error("TIKTOK ALL-IN-ONE ERROR:", err.response?.data || err.message);
      await client.reply(
        m.chat,
        "❌ Error al procesar TikTok.",
        m,
        global.channelInfo
      );
    }
  }
};
