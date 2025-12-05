// commands/xnxx.js
const axios = require('axios');

const API_BASE = 'https://api-sky.ultraplus.click';
const API_KEY  = 'M8EQKBf7LhgH'; // tu API Key

const handler = async (msg, { conn, args, command }) => {
  const chatId = msg.key.remoteJid;
  const text = args.join(" ");
  const pref = global.prefixes?.[0] || ".";

  if (!text) {
    return conn.sendMessage(chatId, {
      text: `⚠️ Uso incorrecto del comando.\n\n📌 Ejemplo: ${pref}${command} https://www.xnxx.com/video-XXXX/...`
    }, { quoted: msg });
  }

  await conn.sendMessage(chatId, { react: { text: '⏳', key: msg.key } });

  try {
    const res = await axios.get(`${API_BASE}/api/nsfw/xnxx.js`, {
      params: { url: text },
      headers: { Authorization: `Bearer ${API_KEY}` },
      timeout: 60000
    });

    if (!res.data || res.data.status !== 'true' || !res.data.data || !res.data.data.video) {
      throw new Error('No se pudo obtener el video de la URL.');
    }

    const data = res.data.data; // { title, video, thumbnail, duration, ... }

    // Enviar miniatura con info
    await conn.sendMessage(chatId, {
      image: { url: data.thumbnail },
      caption: `🎬 *${data.title}*\n⏱ Duración: ${data.duration || 'Desconocida'}\n🌐 Fuente: XNXX`,
      mimetype: 'image/jpeg'
    }, { quoted: msg });

    // Descargar video y enviar
    const videoRes = await axios.get(data.video, { responseType: 'arraybuffer', timeout: 120000 });
    await conn.sendMessage(chatId, {
      video: Buffer.from(videoRes.data),
      mimetype: 'video/mp4',
      fileName: `${data.title}.mp4`,
      caption: `🎬 Aquí tienes tu video\n🌐 Fuente: XNXX`
    }, { quoted: msg });

    await conn.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

  } catch (err) {
    console.error("❌ Error en comando XNXX:", err);
    await conn.sendMessage(chatId, {
      text: `❌ Error al procesar el video: ${err.message}`
    }, { quoted: msg });
    await conn.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
  }
};

// Exportando con .run para evitar el error cmdData.run
module.exports = {
  run: handler,
  command: ["xnxx", "xn"]
};
