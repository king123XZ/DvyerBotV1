const axios = require("axios");

const API_KEY = "dvyer";
const MAX_MB = 1800; // límite en MB

module.exports = {
  command: ["mediafire", "mf"],
  category: "downloader",
  description: "Descarga archivos de MediaFire sin usar stream",

  run: async (client, m, args) => {
    if (!args[0] || !args[0].includes("mediafire.com")) {
      return m.reply("❌ Enlace inválido\nEjemplo: .mf https://www.mediafire.com/file/xxxx");
    }

    await m.reply("⏳ Obteniendo información del archivo...");

    try {
      // 1️⃣ Obtener info del archivo
      const res = await axios.get(
        "https://api-adonix.ultraplus.click/download/mediafire",
        { params: { apikey: API_KEY, url: args[0] }, timeout: 0 }
      );

      const files = res.data?.result || [];
      if (!files.length) return m.reply("❌ No se pudo obtener el archivo.");

      const file = files[0];

      // 2️⃣ Calcular tamaño en MB
      let sizeMB = 0;
      if (file.size.toUpperCase().includes("KB")) sizeMB = parseFloat(file.size) / 1024;
      else if (file.size.toUpperCase().includes("MB")) sizeMB = parseFloat(file.size);
      else if (file.size.toUpperCase().includes("GB")) sizeMB = parseFloat(file.size) * 1024;

      if (sizeMB > MAX_MB)
        return m.reply(`❌ Archivo demasiado grande (${sizeMB.toFixed(2)} MB). Límite: ${MAX_MB} MB`);

      await m.reply(`📥 Descargando archivo completo...\n📄 ${decodeURIComponent(file.nama)}\n📏 ${file.size}`);

      // 3️⃣ Descargar el archivo completo en memoria
      const download = await axios.get(file.link, { responseType: "arraybuffer", timeout: 0 });

      const buffer = Buffer.from(download.data);

      // 4️⃣ Enviar al chat
      await client.sendMessage(
        m.chat,
        {
          document: buffer,
          mimetype: `application/${file.mime}`,
          fileName: decodeURIComponent(file.nama),
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

