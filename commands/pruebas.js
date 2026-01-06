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

    await m.reply("⬇️ Obteniendo enlace de descarga...");

    try {
      const res = await axios.post(
        "https://api-sky.ultraplus.click/aio1",
        { url },
        { headers: { apikey: API_KEY } }
      );

      const data = res.data;

      if (!data.status || !data.result?.media) {
        console.log("RESPUESTA API:", data);
        return m.reply("❌ No se pudo obtener el enlace del video.");
      }

      const { title, media } = data.result;

      // Enviar el link directamente al usuario
      await client.sendMessage(
        m.chat,
        {
          text: `🎬 *${title}*\n📥 Descarga aquí tu video de YouTube:\n${media}`
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("YOUTUBE DL ERROR:", err.response?.data || err);
      m.reply("❌ Error al obtener el enlace del video.");
    }
  }
};

