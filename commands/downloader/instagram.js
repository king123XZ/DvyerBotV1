const axios = require("axios");

module.exports = {
  command: ["instavid", "instagram"],
  description: "Descarga automáticamente videos o imágenes de Instagram",
  category: "downloader",
  use: "instavid <link>",

  run: async (client, m, args) => {
    if (!args.length) return m.reply("❌ Ingresa un enlace de Instagram.");

    const url = args[0];

    try {
      await m.reply("⏳ Procesando tu contenido de Instagram...");

      // Llamada al endpoint
      const { data } = await axios.post(
        "https://api-sky.ultraplus.click/instagram",
        { url },
        { headers: { apikey: "sk_f606dcf6-f301-4d69-b54b-505c12ebec45" } }
      );

      if (!data.status) return m.reply("❌ No se pudo procesar el enlace de Instagram.");

      const items = data.result.media.items;
      if (!items || !items.length) return m.reply("❌ No se encontró contenido.");

      // Selecciona el primer video o imagen disponible
      const item = items.find(i => i.type === "video") || items.find(i => i.type === "image");
      if (!item) return m.reply("❌ No se encontró contenido compatible.");

      // Descargar contenido
      const mediaData = await axios.get(item.url, { responseType: "arraybuffer" });

      // Enviar contenido
      await client.sendMessage(m.chat, {
        [item.type]: mediaData.data,
        mimetype: item.type === "video" ? "video/mp4" : "image/jpeg",
        fileName: `instagram_${item.type}.${item.type === "video" ? "mp4" : "jpg"}`,
        caption: `🎬 Contenido de Instagram descargado (${item.type})`
      }, { quoted: m });

    } catch (err) {
      console.error("ERROR INSTAGRAM:", err.response?.data || err.message);
      m.reply("❌ Ocurrió un error al descargar el contenido de Instagram.");
    }
  }
};
