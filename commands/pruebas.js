const axios = require("axios");

module.exports = {
  command: ["ytsp"],
  category: "downloader",

  run: async (client, m, args) => {
    const url = args[0];
    if (!url || !url.startsWith("http")) return m.reply("❌ Enlace no válido.");

    await m.reply("⏳ Procesando enlace...");

    try {
      const response = await axios.post(
        "https://api-sky.ultraplus.click/aio1",
        { url },
        { headers: { apikey: "sk_f606dcf6-f301-4d69-b54b-505c12ebec45" } }
      );

      const data = response.data;

      if (!data.status) return m.reply("❌ No se pudo procesar el enlace.");

      const { title, media, type } = data.result;

      // Si es video grande, enviamos el link en vez de descargarlo
      if (type === "video") {
        return m.reply(`🎬 *${title}*\nArchivo muy grande para WhatsApp.\nDescárgalo aquí:\n${media}`);
      }

      // Audio siempre se puede enviar
      if (type === "audio") {
        await client.sendMessage(
          m.chat,
          { audio: { url: media }, fileName: `${title}.mp3`, mimetype: "audio/mpeg" },
          { quoted: m }
        );
      }

    } catch (err) {
      console.error(err);
      return m.reply("❌ Ocurrió un error al procesar el enlace. Puede ser un problema de red o que el archivo sea muy grande.");
    }
  }
};
