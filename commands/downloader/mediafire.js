const axios = require("axios");

const API_KEY = "dvyer"; // Nueva API key de Donix
const MAX_MB = 1800;

module.exports = {
  command: ["mediafire", "mf"],
  category: "downloader",

  run: async (client, m, args) => {
    if (!args[0] || !args[0].includes("mediafire.com")) {
      return m.reply(
        "❌ Enlace inválido\n\nEjemplo:\n.mf https://www.mediafire.com/file/xxxx"
      );
    }

    await m.reply("⏳ Analizando archivo de MediaFire...");

    try {
      // 🌐 Llamada a la nueva API de Donix
      const res = await axios.get("https://api-adonix.ultraplus.click/download/mediafire", {
        params: {
          apikey: API_KEY,
          url: args[0],
        },
        timeout: 20000,
      });

      const files = res.data?.result?.files || [];
      if (!files.length) {
        return m.reply("❌ No se pudo obtener el archivo de MediaFire.");
      }

      const file = files[0];

      // 📏 Obtener tamaño en MB
      const sizeMatch = file.size.match(/([\d.]+)\s*MB/i);
      const sizeMB = sizeMatch ? parseFloat(sizeMatch[1]) : 0;

      if (sizeMB > MAX_MB) {
        return m.reply(
          `❌ Archivo demasiado grande\n\n📦 Tamaño: ${sizeMB} MB\n🔒 Límite: ${MAX_MB} MB`
        );
      }

      await m.reply(
        `📥 Descargando archivo...\n\n📄 ${file.name}\n📏 ${file.size}\n\n👑 DevYer`
      );

      // 📡 Descargar como stream
      const stream = await axios.get(file.link || file.download, {
        responseType: "arraybuffer",
        timeout: 0,
      });

      // 📤 Enviar como DOCUMENTO
      await client.sendMessage(
        m.chat,
        {
          document: Buffer.from(stream.data),
          mimetype: "application/octet-stream",
          fileName: file.name,
          caption: `📦 MediaFire\n👑 DevYer`,
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("MEDIAFIRE ERROR:", err.response?.data || err.message);
      m.reply("❌ Error al descargar el archivo de MediaFire.");
    }
  }
};
