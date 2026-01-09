const axios = require("axios");

const API_KEY = "dvyer"; 
const MAX_MB = 1800;

module.exports = {
  command: ["mediafire", "mf"],
  category: "downloader",

  run: async (client, m, args) => {
    if (!args[0] || !args[0].includes("mediafire.com")) {
      return m.reply("❌ Enlace inválido\nEjemplo: .mf https://www.mediafire.com/file/xxxx");
    }

    await m.reply("⏳ Obteniendo información del archivo...");

    try {
      const res = await axios.get("https://api-adonix.ultraplus.click/download/mediafire", {
        params: { apikey: API_KEY, url: args[0] },
        timeout: 0 // espera indefinida
      });

      const files = res.data?.result || [];
      if (!files.length) return m.reply("❌ No se pudo obtener el archivo.");

      const file = files[0];

      // Validar tamaño
      const sizeMatch = file.size.match(/([\d.]+)\s*MB/i);
      const sizeMB = sizeMatch ? parseFloat(sizeMatch[1]) : 0;
      if (sizeMB > MAX_MB) return m.reply(`❌ Archivo demasiado grande (${sizeMB} MB). Límite: ${MAX_MB} MB`);

      await m.reply(`📥 Preparando descarga...\n📄 ${file.nama}\n📏 ${file.size}`);

      // Descargar archivo como stream
      const stream = await axios({
        method: "get",
        url: file.link,
        responseType: "stream",
        timeout: 0
      });

      // Enviar directamente el stream
      await client.sendMessage(
        m.chat,
        {
          document: stream.data,
          mimetype: `application/${file.mime}`,
          fileName: file.nama,
          caption: `📦 MediaFire`
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("MEDIAFIRE ERROR:", err.response?.data || err.message);
      m.reply("❌ Error al descargar el archivo de MediaFire.");
    }
  }
}; // <-- Cierre correcto de module.exports
