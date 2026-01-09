const axios = require("axios");

const API_KEY = "dvyer";
const MAX_MB = 1800; // límite en MB

module.exports = {
  command: ["mediafire", "mf"],
  category: "downloader",

  run: async (client, m, args) => {
    if (!args[0] || !args[0].includes("mediafire.com")) {
      return m.reply("❌ Enlace inválido\nEjemplo: .mf https://www.mediafire.com/file/xxxx");
    }

    await m.reply("⏳ Obteniendo información del archivo...");

    try {
      // Obtener info del archivo (espera indefinida)
      const res = await axios.get("https://api-adonix.ultraplus.click/download/mediafire", {
        params: { apikey: API_KEY, url: args[0] },
        timeout: 0
      });

      const files = res.data?.result || [];
      if (!files.length) return m.reply("❌ No se pudo obtener el archivo.");

      const file = files[0];

      // Validar tamaño
      let sizeMB = 0;
      if (file.size.toUpperCase().includes("KB")) {
        sizeMB = parseFloat(file.size) / 1024; // KB → MB
      } else if (file.size.toUpperCase().includes("MB")) {
        sizeMB = parseFloat(file.size);
      } else if (file.size.toUpperCase().includes("GB")) {
        sizeMB = parseFloat(file.size) * 1024; // GB → MB
      }

      if (sizeMB > MAX_MB)
        return m.reply(`❌ Archivo demasiado grande (${sizeMB.toFixed(2)} MB). Límite: ${MAX_MB} MB`);

      await m.reply(`📥 Preparando descarga...\n📄 ${file.nama}\n📏 ${file.size}`);

      // Descargar archivo como stream directo
      const stream = await axios({
        method: "get",
        url: file.link,
        responseType: "stream",
        timeout: 0
      });

      // Enviar stream directamente al chat
      await client.sendMessage(
        m.chat,
        {
          document: stream.data,
          mimetype: `application/${file.mime}`,
          fileName: decodeURIComponent(file.nama), // decodifica URL
          caption: `📦 MediaFire`
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("MEDIAFIRE ERROR:", err.response?.data || err.message);
      m.reply("❌ Error al descargar el archivo de MediaFire.");
    }
  }
};
