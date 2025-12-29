const axios = require("axios");

module.exports = {
  command: ["instavid", "instagram"],
  description: "Descarga videos de Instagram",
  category: "downloader",
  use: "instavid <link>",

  run: async (client, m, args) => {
    if (!args.length) return m.reply("❌ Ingresa un enlace de Instagram.");

    const url = args[0];

    try {
      await m.reply("⏳ Procesando tu video de Instagram...");

      const { data } = await axios.post(
        "https://api-sky.ultraplus.click/instagram",
        { url },
        { headers: { apikey: "sk_f606dcf6-f301-4d69-b54b-505c12ebec45" } }
      );

      if (!data.status) {
        return m.reply("❌ No se pudo procesar el enlace de Instagram.");
      }

      const result = data.result;
      const videoUrl = result?.media?.video || result?.media?.image;

      if (!videoUrl) return m.reply("❌ No se encontró el video.");

      const videoData = await axios.get(videoUrl, { responseType: "arraybuffer" });

      await client.sendMessage(m.chat, {
        video: videoData.data,
        mimetype: "video/mp4",
        fileName: "instagram_video.mp4",
        caption: `🎬 Video de Instagram descargado con éxito`
      }, { quoted: m });

    } catch (err) {
      console.error("ERROR INSTAGRAM:", err.response?.data || err.message);
      m.reply("❌ Ocurrió un error al descargar el video de Instagram.");
    }
  }
};
