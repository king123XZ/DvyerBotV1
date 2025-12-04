const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const { pipeline } = require("stream");
const streamPipe = promisify(pipeline);

const API_BASE = "https://tu-dominio"; // Cambia a tu dominio real
const API_KEY = "AvTYmkABPtmG";        // Tu API Key

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Descarga URL a archivo temporal
async function downloadToFile(url, filePath) {
  const res = await axios.get(url, { responseType: "stream" });
  await streamPipe(res.data, fs.createWriteStream(filePath));
  return filePath;
}

// Tamaño en MB
function fileSizeMB(filePath) {
  const b = fs.statSync(filePath).size;
  return b / (1024 * 1024);
}

module.exports = {
  command: ["tiktok"],
  description: "Descarga videos de TikTok",
  category: "descargas",

  run: async (client, m, args) => {
    const text = args.join(" ");
    if (!text) {
      return client.sendMessage(m.chat, {
        text: "✳️ Usa: .tiktok <url>\nEj: .tiktok https://www.tiktok.com/@user/video/123"
      }, { quoted: m });
    }

    const chatId = m.chat;

    await client.sendMessage(chatId, { react: { text: "⏳", key: m.key } });

    try {
      const res = await axios.get(`${API_BASE}/api/download/tiktok.js`, {
        params: { url: text },
        headers: { Authorization: `Bearer ${API_KEY}`, "X-API-Key": API_KEY },
        timeout: 60000
      });

      const data = res.data.data;
      if (!data || !data.video) {
        return client.sendMessage(chatId, { text: "❌ No se pudo obtener el video." }, { quoted: m });
      }

      const caption = `
🎬 TikTok Descarga
• Título: ${data.title || "Desconocido"}
• API: ${API_BASE}
      `.trim();

      const buttons = [
        { buttonId: "video", buttonText: { displayText: "📁 Video MP4" }, type: 1 },
        { buttonId: "audio", buttonText: { displayText: "🎵 Audio MP3" }, type: 1 }
      ];

      const buttonMessage = {
        image: { url: data.thumbnail },
        caption,
        footer: "Selecciona una opción",
        buttons,
        headerType: 4
      };

      const preview = await client.sendMessage(chatId, buttonMessage, { quoted: m });

      // Guardar tarea pendiente
      client._tiktokPending = client._tiktokPending || {};
      client._tiktokPending[preview.key.id] = { chatId, data, msg: m };

    } catch (e) {
      console.error(e);
      await client.sendMessage(chatId, { text: "❌ Error al descargar TikTok." }, { quoted: m });
    }
  }
};

