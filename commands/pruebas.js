const axios = require("axios");

module.exports = {
  command: ["ytsp"],
  category: "downloader",

  run: async (client, m, args) => {
    const url = args[0];
    if (!url || !url.startsWith("http")) return m.reply("❌ Enlace no válido.");

    await m.reply("⏳ Procesando...");

    try {
      const response = await axios.post(
        "https://api-sky.ultraplus.click/aio1",
        { url },
        { headers: { apikey: "sk_f606dcf6-f301-4d69-b54b-505c12ebec45" } }
      );

      const data = response.data;

      if (!data.status) return m.reply("❌ No se pudo descargar el contenido.");

      const { title, media, type } = data.result;

      // Si es video grande, enviamos el link en lugar de descargarlo
      if (type === "video") {
        return m.reply(`🎬 *${title}*\nEl archivo es muy grande, descárgalo aquí:\n${media}`);
      }

      // Audio siempre podemos enviar
      if (type === "audio") {
        await client.sendMessage(
          m.chat,
          { audio: { url: media }, fileName: `${title}.mp3`, mimetype: "audio/mpeg" },
          { quoted: m }
        );
      }

    } catch (err) {
      console.error(err);
      return m.reply("❌ Ocurrió un error al procesar el enlace.");
    }
  }
};
