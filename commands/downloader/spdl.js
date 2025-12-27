const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";

module.exports = {
  command: ["spdl"],
  category: "downloader",

  run: async (client, m, args) => {
    if (!args[0]) {
      return m.reply("❌ Falta el enlace de Spotify.");
    }

    const url = args[0];
    await m.reply("⬇️ Descargando audio desde Spotify...");

    try {
      const res = await axios.post(
        "https://api-sky.ultraplus.click/spotify/download",
        { url },
        { headers: { apikey: API_KEY } }
      );

      // ✅ LINK REAL
      const audioUrl = res.data?.result?.response?.url;

      if (!audioUrl) {
        console.log("RESPUESTA API:", res.data);
        return m.reply("❌ No se pudo obtener el enlace del audio.");
      }

      await client.sendMessage(
        m.chat,
        {
          audio: { url: audioUrl },
          mimetype: "audio/mpeg",
          fileName: "spotify.mp3",
          caption: "🎧 *Spotify Downloader*\n👑 Creador: DevYer"
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("SPOTIFY DL ERROR:", err.response?.data || err);
      m.reply("❌ Error al descargar el audio.");
    }
  }
};

