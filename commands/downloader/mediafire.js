const axios = require("axios");

const API_KEY = "dvyer";
const MAX_MB = 1800; // límite en MB

module.exports = {
  command: ["mediafire", "mf"],
  categoria: "descarga",
  description: "Descarga archivos de MediaFire",

  run: async (client, m, args) => {
    if (!args[0] || !args[0].includes("mediafire.com")) {
      return client.reply(
        m.chat,
        "❌ Enlace inválido\nEjemplo: .mf https://www.mediafire.com/file/xxxx",
        m,
        global.channelInfo
      );
    }

    await client.reply(
      m.chat,
      "⏳ Obteniendo información del archivo...",
      m,
      global.channelInfo
    );

    try {
      // 1️⃣ Obtener info del archivo
      const res = await axios.get(
        "https://api-adonix.ultraplus.click/download/mediafire",
        { params: { apikey: API_KEY, url: args[0] }, timeout: 0 }
      );

      const files = res.data?.result || [];
      if (!files.length) return client.reply(
        m.chat,
        "❌ No se pudo obtener el archivo.",
        m,
        global.channelInfo
      );

      const file = files[0];

      // 2️⃣ Calcular tamaño en MB
      let sizeMB = 0;
      if (file.size.toUpperCase().includes("KB")) sizeMB = parseFloat(file.size) / 1024;
      else if (file.size.toUpperCase().includes("MB")) sizeMB = parseFloat(file.size);
      else if (file.size.toUpperCase().includes("GB")) sizeMB = parseFloat(file.size) * 1024;

      if (sizeMB > MAX_MB)
        return client.reply(
          m.chat,
          `❌ Archivo demasiado grande (${sizeMB.toFixed(2)} MB). Límite: ${MAX_MB} MB`,
          m,
          global.channelInfo
        );

      await client.reply(
        m.chat,
        `📥 Descargando archivo completo...\n📄 ${decodeURIComponent(file.nama)}\n📏 ${file.size}`,
        m,
        global.channelInfo
      );

      // 3️⃣ Descargar el archivo completo en memoria
      const download = await axios.get(file.link, { responseType: "arraybuffer", timeout: 0 });
      const buffer = Buffer.from(download.data);

      // 4️⃣ Enviar al chat usando channelInfo
      await client.sendMessage(
        m.chat,
        {
          document: buffer,
          mimetype: `application/${file.mime}`,
          fileName: decodeURIComponent(file.nama),
          caption: `📦 MediaFire`
        },
        { quoted: m, ...global.channelInfo }
      );

    } catch (err) {
      console.error("MEDIAFIRE ERROR:", err.response?.data || err.message);
      await client.reply(
        m.chat,
        "❌ Error al descargar el archivo de MediaFire.",
        m,
        global.channelInfo
      );
    }
  }
};
