// commands/tiktok.js
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const { pipeline } = require("stream");
const streamPipe = promisify(pipeline);

// Config de tu API
const API_BASE = "https://api-sky.ultraplus.click/tools"; // Tu endpoint
const API_KEY = "AvTYmkABPtmG";                           // Tu API Key

// Función para descargar archivos a disco
async function downloadToFile(url, filePath) {
  const res = await axios.get(url, { responseType: "stream" });
  await streamPipe(res.data, fs.createWriteStream(filePath));
  return filePath;
}

// Tamaño del archivo en MB
function fileSizeMB(filePath) {
  const b = fs.statSync(filePath).size;
  return b / (1024 * 1024);
}

module.exports = {
  command: ["tiktok"],
  description: "Descarga videos de TikTok automáticamente",
  category: "descargas",

  run: async (client, m, args) => {
    const text = args.join(" ");
    if (!text) {
      return client.sendMessage(m.chat, {
        text: "✳️ Usa: .tiktok <url>\nEj: .tiktok https://www.tiktok.com/@user/video/123"
      }, { quoted: m });
    }

    const chatId = m.chat;

    // Reacción de carga
    await client.sendMessage(chatId, { react: { text: "⏳", key: m.key } });

    try {
      // Llamada a tu API
      const res = await axios.get(`${API_BASE}/tiktok.js`, {
        params: { url: text },
        headers: { 
          Authorization: `Bearer ${API_KEY}`,
          "X-API-Key": API_KEY
        },
        timeout: 60000
      });

      // Tu API devuelve { data: { video: "url_del_video", title: "titulo" } }
      const data = res.data.data;
      if (!data || !data.video) {
        return client.sendMessage(chatId, { text: "❌ No se pudo obtener el video." }, { quoted: m });
      }

      // Crear carpeta tmp si no existe
      const tmp = path.join(__dirname, "../tmp");
      if (!fs.existsSync(tmp)) fs.mkdirSync(tmp, { recursive: true });

      const file = path.join(tmp, `${Date.now()}_video.mp4`);
      await downloadToFile(data.video, file);

      // Validar tamaño (WhatsApp ~99MB)
      if (fileSizeMB(file) > 99) {
        await client.sendMessage(chatId, { text: `❌ El video pesa demasiado (${fileSizeMB(file).toFixed(2)}MB)` }, { quoted: m });
        fs.unlinkSync(file);
        return;
      }

      // Enviar video directamente
      await client.sendMessage(chatId, {
        video: fs.readFileSync(file),
        mimetype: "video/mp4",
        fileName: `${data.title || "video"}.mp4`,
        caption: `🎬 TikTok descargado automáticamente`
      }, { quoted: m });

      // Borrar archivo temporal
      fs.unlinkSync(file);

    } catch (e) {
      console.error(e);
      await client.sendMessage(chatId, { text: "❌ Error al descargar el video." }, { quoted: m });
    }
  }
};

