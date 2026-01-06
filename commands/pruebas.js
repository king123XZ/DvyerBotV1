const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";

module.exports = {
  command: ["yt1"],
  category: "downloader",

  run: async (client, m, args) => {
    const url = args[0];

    if (!url || !url.startsWith("http")) {
      return m.reply("❌ Enlace de YouTube no válido.");
    }

    await m.reply("⬇️ Descargando video de YouTube...");

    try {
      // Llamada a la API
      const res = await axios.post(
        "https://api-sky.ultraplus.click/aio1",
        { url },
        { headers: { apikey: API_KEY } }
      );

      const data = res.data;

      if (!data.status || !data.result?.media) {
        console.log("RESPUESTA API:", data);
        return m.reply("❌ No se pudo obtener el video.");
      }

      const { title, media } = data.result;

      // Enviar el video al chat automáticamente
      await client.sendMessage(
        m.chat,
        {
          video: { url: media },
          mimetype: "video/mp4",
          fileName: `${title}.mp4`,
          caption: `🎬 *${title}*\n👑 Creador: DevYer`
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("YOUTUBE DL ERROR:", err.response?.data || err);
      m.reply("❌ Error al descargar el video de YouTube.");
    }
  }
};
