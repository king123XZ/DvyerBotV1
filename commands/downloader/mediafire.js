const axios = require("axios");
const ProgressBar = require("progress"); // Para mostrar progreso en consola (opcional)
const MAX_MB = 1800; // Límite máximo configurable
const CANCEL_THRESHOLD_MB = 500; // Umbral para advertencia de cancelación

module.exports = {
  command: ["mediafire", "mf"],
  category: "downloader",
  description: "Descarga archivos de MediaFire con progreso y cancelación",

  run: async (client, m, args) => {
    if (!args[0] || !args[0].includes("mediafire.com")) {
      return m.reply("❌ Enlace inválido\nEjemplo: .mf https://www.mediafire.com/file/xxxx");
    }

    await m.reply("⏳ Obteniendo información del archivo...");

    try {
      // 1️⃣ Obtener info del archivo
      const res = await axios.get("https://api-adonix.ultraplus.click/download/mediafire", {
        params: { apikey: "dvyer", url: args[0] },
        timeout: 0
      });

      const files = res.data?.result || [];
      if (!files.length) return m.reply("❌ No se pudo obtener el archivo.");

      const file = files[0];
      const fileName = decodeURIComponent(file.nama);

      // 2️⃣ Calcular tamaño en MB
      let sizeMB = 0;
      if (file.size.toUpperCase().includes("KB")) sizeMB = parseFloat(file.size) / 1024;
      else if (file.size.toUpperCase().includes("MB")) sizeMB = parseFloat(file.size);
      else if (file.size.toUpperCase().includes("GB")) sizeMB = parseFloat(file.size) * 1024;

      if (sizeMB > MAX_MB)
        return m.reply(`❌ Archivo demasiado grande (${sizeMB.toFixed(2)} MB). Límite: ${MAX_MB} MB`);

      // Advertencia si el archivo es grande
      if (sizeMB > CANCEL_THRESHOLD_MB) {
        const warningMsg = await m.reply(
          `⚠️ Este archivo es grande (${sizeMB.toFixed(2)} MB). ` +
          "Esto puede tardar mucho tiempo en descargarse. `Envía 'cancelar' para detener la descarga.`"
        );

        // Espera la respuesta del usuario
        const filter = (msg) => msg.from === m.from && msg.body.toLowerCase() === "cancelar";
        const cancel = await client.waitMessage(m.from, filter, 30000).catch(() => null);

        if (cancel) return m.reply("❌ Descarga cancelada por el usuario.");
      }

      await m.reply(`📥 Descargando archivo...\n📄 ${fileName}\n📏 ${file.size}`);

      // 3️⃣ Descargar archivo con seguimiento de progreso
      const download = await axios({
        method: "get",
        url: file.link,
        responseType: "arraybuffer",
        timeout: 0,
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.lengthComputable) {
            const percent = ((progressEvent.loaded / progressEvent.total) * 100).toFixed(2);
            client.sendPresenceUpdate(m.chat, "composing"); // Mantiene activo el chat
            // Opcional: puedes enviar mensajes de progreso cada cierto % si quieres
          }
        }
      });

      const buffer = Buffer.from(download.data);

      // 4️⃣ Enviar archivo al chat
      await client.sendMessage(
        m.chat,
        {
          document: buffer,
          mimetype: `application/${file.mime}`,
          fileName: fileName,
          caption: `📦 MediaFire\n📏 ${file.size}`
        },
        { quoted: m }
      );

      await m.reply("✅ Descarga completada.");

    } catch (err) {
      console.error("MEDIAFIRE ERROR:", err.response?.data || err.message);
      m.reply("❌ Error al descargar el archivo de MediaFire.");
    }
  }
};
