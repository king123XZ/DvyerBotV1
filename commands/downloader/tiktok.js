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

module.exports = async (msg, { conn, text }) => {
  if (!text || !text.trim()) {
    return conn.sendMessage(msg.key.remoteJid, {
      text: "✳️ Usa: .tiktok <url>\nEj: .tiktok https://www.tiktok.com/@user/video/123"
    }, { quoted: msg });
  }

  const chatId = msg.key.remoteJid;

  // Reacción de carga
  await conn.sendMessage(chatId, { react: { text: "⏳", key: msg.key } });

  try {
    // Llamada a la API TikTok
    const res = await axios.get(`${API_BASE}/api/download/tiktok.js`, {
      params: { url: text },
      headers: { Authorization: `Bearer ${API_KEY}`, "X-API-Key": API_KEY },
      timeout: 60000
    });

    const data = res.data.data;
    if (!data || !data.video) {
      return conn.sendMessage(chatId, { text: "❌ No se pudo obtener el video." }, { quoted: msg });
    }

    const caption = `
🎬 TikTok Descarga
• Título: ${data.title || "Desconocido"}
• API: ${API_BASE}
    `.trim();

    // Enviar preview con botones
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

    const preview = await conn.sendMessage(chatId, buttonMessage, { quoted: msg });

    // Guardar tarea pendiente para escuchar botones
    conn._tiktokPending = conn._tiktokPending || {};
    conn._tiktokPending[preview.key.id] = { chatId, data, msg };

  } catch (e) {
    console.error(e);
    await conn.sendMessage(chatId, { text: "❌ Error al descargar TikTok." }, { quoted: msg });
  }
};

// Manejo de botones
module.exports.handleButton = async (conn, m) => {
  if (!m.message?.buttonsResponseMessage) return;
  const id = m.message.buttonsResponseMessage?.selectedButtonId;
  const citado = m.message.buttonsResponseMessage?.contextInfo?.stanzaId;
  const job = conn._tiktokPending?.[citado];
  if (!job) return;

  const { chatId, data, msg } = job;
  const tmp = path.join(__dirname, "../tmp");
  if (!fs.existsSync(tmp)) fs.mkdirSync(tmp, { recursive: true });

  if (id === "video") {
    // Descargar video
    const file = path.join(tmp, `${Date.now()}_video.mp4`);
    await downloadToFile(data.video, file);

    if (fileSizeMB(file) > 99) {
      await conn.sendMessage(chatId, { text: `❌ El video pesa demasiado (${fileSizeMB(file).toFixed(2)}MB)` }, { quoted: msg });
      fs.unlinkSync(file);
      return;
    }

    await conn.sendMessage(chatId, {
      video: fs.readFileSync(file),
      mimetype: "video/mp4",
      fileName: `${data.title || "video"}.mp4`,
      caption: `🎬 Aquí tienes tu video`
    }, { quoted: msg });

    fs.unlinkSync(file);

  } else if (id === "audio") {
    // Descargar audio
    const file = path.join(tmp, `${Date.now()}_audio.mp3`);
    await downloadToFile(data.audio || data.video, file); // fallback si no hay audio

    if (fileSizeMB(file) > 99) {
      await conn.sendMessage(chatId, { text: `❌ El audio pesa demasiado (${fileSizeMB(file).toFixed(2)}MB)` }, { quoted: msg });
      fs.unlinkSync(file);
      return;
    }

    await conn.sendMessage(chatId, {
      audio: fs.readFileSync(file),
      mimetype: "audio/mpeg",
      fileName: `${data.title || "audio"}.mp3`
    }, { quoted: msg });

    fs.unlinkSync(file);
  }

  // Elimina la tarea pendiente
  delete conn._tiktokPending[citado];
};

module.exports.command = ["tiktok"];
