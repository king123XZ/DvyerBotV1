const axios = require("axios");

const API_KEY = "dvyer"; // Tu API key de Donix
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

    await m.reply("⏳ Obteniendo información del archivo...");

    try {
      // 🌐 Obtener info del archivo desde la API
      const res = await axios.get("https://api-adonix.ultraplus.click/download/mediafire", {
        params: { apikey: API_KEY, url: args[0] },
        timeout: 30000, // 30s solo para obtener info
      });

      const files = res.data?.result || [];
      if (!files.length) {
        return m.reply("❌ No se pudo obtener el archivo de MediaFire.");
      }

      const file = files[0];

      // 📏 Obtener tamaño en MB
      const sizeMatch = file.size.match(/([\d.]+)\s*MB/i);
      const sizeMB = sizeMatch ? parseFloat(sizeMatch[1]) : 0;

      if (sizeMB > MAX_MB) {
        return m.reply(
          `❌ Archivo demasiado grande\n📦 Tamaño: ${sizeMB} MB\n🔒 Límite: ${MAX_MB} MB`
        );
      }

      await m.reply(
        `📥 Preparando descarga...\n\n📄 ${file.nama}\n📏 ${file.size}\n\n👑 DevYer`
      );

      // 📡 Descargar el archivo como stream directo
      const stream = await axios({
        method: "get",
        url: file.link,
        responseType: "stream",
        timeout: 0, // sin timeout para archivos grandes
      });

      // 📤 Enviar al chat como documento usando el stream
      await client.sendMessage(
        m.chat,
        {
          document: stream.data,
          mimetype: `application/${file.mime}`,
          fileName: file.nama,
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
