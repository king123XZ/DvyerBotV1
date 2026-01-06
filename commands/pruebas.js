const axios = require("axios");

module.exports = {
  command: ["ytsp"],
  category: "downloader",

  run: async (client, m, args) => {
    const url = args[0];
    if (!url || !url.startsWith("http")) {
      return m.reply("❌ Por favor, ingresa un enlace válido de YouTube o Spotify.");
    }

    await m.reply("⏳ Descargando, espera un momento...");

    try {
      const response = await axios.post(
        "https://api-sky.ultraplus.click/aio1",
        { url },
        { headers: { apikey: "sk_f606dcf6-f301-4d69-b54b-505c12ebec45" } }
      );

      const data = response.data;

      if (!data.status) {
        return m.reply("❌ No se pudo descargar el contenido.");
      }

      const { title, media, type } = data.result;

      // Detectar tipo y enviar archivo
      if (type === "audio") {
        await client.sendMessage(
          m.chat,
          { audio: { url: media }, fileName: `${title}.mp3`, mimetype: "audio/mpeg" },
          { quoted: m }
        );
      } else if (type === "video") {
        await client.sendMessage(
          m.chat,
          { video: { url: media }, fileName: `${title}.mp4`, mimetype: "video/mp4" },
          { quoted: m }
        );
      } else {
        return m.reply("❌ Tipo de archivo no soportado.");
      }

    } catch (err) {
      console.error(err);
      return m.reply("❌ Ocurrió un error al descargar el contenido.");
    }
  }
};
