const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";

module.exports = {
  command: ["spdl"],
  category: "downloader",

  run: async (client, m, args) => {
    if (!args[0]) return;

    const url = args[0];
    await m.reply("⬇️ Descargando desde Spotify...");

    try {
      const res = await axios.post(
        "https://api-sky.ultraplus.click/spotify/download",
        { url },
        { headers: { apikey: API_KEY } }
      );

      const data = res.data?.result?.response;
      if (!data || !data.download) {
        console.log("RESPUESTA API:", res.data);
        return m.reply("❌ No se pudo obtener el audio.");
      }

      await client.sendMessage(
        m.chat,
        {
          audio: { url: data.download },
          mimetype: "audio/mpeg",
          fileName: `${data.title || "spotify"}.mp3`,
          caption: `🎧 *${data.title || "Spotify"}*\n👑 Creador: DevYer`
        },
        { quoted: m }
      );

    } catch (e) {
      console.error("SPOTIFY DOWNLOAD ERROR:", e.response?.data || e);
      m.reply("❌ Error al descargar el audio.");
    }
  }
};
