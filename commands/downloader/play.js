
// commands/play.js
const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const { promisify } = require("util");
const { pipeline } = require("stream");
const streamPipe = promisify(pipeline);

require('dotenv').config(); // Cargar API_KEY desde .env

const API_BASE = process.env.API_BASE || "https://api-sky.ultraplus.click";
const API_KEY  = process.env.API_KEY  || "Russellxz";

const pending = {};

async function downloadToFile(url, filePath) {
  const res = await axios.get(url, { responseType: "stream" });
  await streamPipe(res.data, fs.createWriteStream(filePath));
  return filePath;
}

function fileSizeMB(filePath) {
  const b = fs.statSync(filePath).size;
  return b / (1024 * 1024);
}

async function callMyApi(url, format) {
  const r = await axios.get(`${API_BASE}/api/download/yt.php`, {
    params: { url, format },
    headers: { Authorization: `Bearer ${API_KEY}` },
    timeout: 60000
  });
  if (!r.data || r.data.status !== "true" || !r.data.data) {
    throw new Error("API inválida o sin datos");
  }
  return r.data.data;
}

module.exports = async (msg, { conn, text }) => {
  const pref = global.prefixes?.[0] || ".";

  if (!text || !text.trim()) {
    return conn.sendMessage(msg.key.remoteJid, { text: `✳️ Usa:\n${pref}play <término>` }, { quoted: msg });
  }

  await conn.sendMessage(msg.key.remoteJid, { react: { text: "⏳", key: msg.key } });

  const res = await yts(text);
  const video = res.videos?.[0];
  if (!video) return conn.sendMessage(msg.key.remoteJid, { text: "❌ Sin resultados." }, { quoted: msg });

  const { url: videoUrl, title, timestamp: duration, views, author, thumbnail } = video;
  const viewsFmt = (views || 0).toLocaleString();

  const caption = `
🎶 *${title}*
⏱ Duración: ${duration}
👀 Vistas: ${viewsFmt}
📝 Autor: ${author?.name || author || "Desconocido"}
🔗 Link: ${videoUrl}
`.trim();

  // Botones interactivos
  const buttons = [
    { buttonId: `play_audio_${videoUrl}`, buttonText: { displayText: "🎵 Audio MP3" }, type: 1 },
    { buttonId: `play_video_${videoUrl}`, buttonText: { displayText: "🎬 Video MP4" }, type: 1 },
    { buttonId: `play_doc_audio_${videoUrl}`, buttonText: { displayText: "📄 Audio Doc" }, type: 1 },
    { buttonId: `play_doc_video_${videoUrl}`, buttonText: { displayText: "📁 Video Doc" }, type: 1 },
  ];

  const message = {
    image: { url: thumbnail },
    caption,
    footer: "Mini Lurus Bot",
    buttons,
    headerType: 4
  };

  const preview = await conn.sendMessage(msg.key.remoteJid, message, { quoted: msg });

  // Guardar tarea pendiente
  pending[preview.key.id] = {
    chatId: msg.key.remoteJid,
    videoUrl,
    title,
    commandMsg: msg
  };
};

// Listener para botones
module.exports.handleButton = async (conn, m) => {
  const id = m?.message?.buttonsResponseMessage?.selectedButtonId;
  if (!id) return;
  const [, type, videoUrl] = id.split("_"); // e.g. play_audio_<url>

  const job = { chatId: m.key.remoteJid, videoUrl, title: videoUrl, commandMsg: m };
  const isDoc = type.includes("doc");
  const format = type.includes("audio") ? "audio" : "video";

  await conn.sendMessage(m.key.remoteJid, { text: `⏳ Descargando ${isDoc ? "documento" : format}...` }, { quoted: m });

  const data = await callMyApi(videoUrl, format);
  const mediaUrl = data[format];

  if (!mediaUrl) return conn.sendMessage(m.key.remoteJid, { text: "❌ No se pudo obtener el archivo." }, { quoted: m });

  const tmp = path.join(__dirname, "../tmp");
  if (!fs.existsSync(tmp)) fs.mkdirSync(tmp, { recursive: true });

  const ext = format === "audio" ? "mp3" : "mp4";
  const filePath = path.join(tmp, `${Date.now()}.${ext}`);
  await downloadToFile(mediaUrl, filePath);

  const buffer = fs.readFileSync(filePath);
  await conn.sendMessage(m.key.remoteJid, {
    [isDoc ? "document" : format]: buffer,
    mimetype: format === "audio" ? "audio/mpeg" : "video/mp4",
    fileName: `${data.title}.${ext}`,
    caption: `🎬 ${data.title}`
  }, { quoted: m });

  fs.unlinkSync(filePath);
};
