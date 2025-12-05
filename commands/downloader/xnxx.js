const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_KEY = 'M8EQKBf7LhgH'; // tu key
const API_URL = 'https://api-sky.ultraplus.click/api/nsfw/xnxx.js';

const handler = async (msg, { conn, args, command }) => {
  const chatId = msg.key.remoteJid;
  const url = args[0];

  if (!url) {
    return conn.sendMessage(chatId, {
      text: `⚠️ Uso: ${command} <URL de XNXX>\nEjemplo: ${command} https://www.xnxx.com/video-XXXX/...`
    }, { quoted: msg });
  }

  await conn.sendMessage(chatId, { react: { text: '⏳', key: msg.key } });

  try {
    // Llamada a la API
    const res = await axios.get(API_URL, {
      params: { url },
      headers: { 
        Authorization: `Bearer ${API_KEY}`,
        'X-API-Key': API_KEY
      }
    });

    const data = res.data;

    if (!data.status || data.status !== "true" || !data.data || !data.data.video) {
      return conn.sendMessage(chatId, { text: "❌ No se pudo obtener el video o la URL es inválida." }, { quoted: msg });
    }

    const videoUrl = data.data.video;
    const title = data.data.title || 'video-xnxx';

    // Descarga temporal
    const tmpDir = path.join(__dirname, '../tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const filePath = path.join(tmpDir, `${Date.now()}-${title.replace(/[^a-z0-9]/gi, '_')}.mp4`);

    const videoResp = await axios.get(videoUrl, { responseType: 'stream' });
    const writer = fs.createWriteStream(filePath);
    videoResp.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    // Enviar video al chat
    await conn.sendMessage(chatId, {
      video: fs.readFileSync(filePath),
      mimetype: 'video/mp4',
      fileName: `${title}.mp4`,
      caption: `🎬 ${title}`
    }, { quoted: msg });

    // Limpieza
    fs.unlinkSync(filePath);

    await conn.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

  } catch (err) {
    console.error('❌ Error al procesar XNXX:', err);
    await conn.sendMessage(chatId, { text: `❌ Error al procesar el video: ${err.message}` }, { quoted: msg });
    await conn.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
  }
};

handler.command = ["xnxx", "xn"];
module.exports = handler;
