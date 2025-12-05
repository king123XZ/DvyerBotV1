// commands/downloader/playaudio.js
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const { promisify } = require("util");
const { pipeline } = require("stream");
const streamPipe = promisify(pipeline);

const API_KEY = "zMqDtV"; // Tu API Key de Neoxr
const API_BASE = "https://api.neoxr.eu/api/play";

// Función para descargar archivos a disco
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

// Transcodificar a MP3 si no es mp3
async function transcodeToMp3(inFile) {
  const outFile = inFile.replace(path.extname(inFile), ".mp3");
  await new Promise((resolve, reject) => {
    ffmpeg(inFile)
      .audioCodec("libmp3lame")
      .audioBitrate("128k")
      .format("mp3")
      .save(outFile)
      .on("end", resolve)
      .on("error", reject);
  });
  return outFile;
}

const handler = async (msg, { conn, args, command }) => {
  const chatId = msg.key.remoteJid;
  const query = args.join(" ").trim();
  const pref = global.prefixes?.[0] || ".";

  if (!query) {
    return conn.sendMessage(chatId, {
      text: `⚠️ Uso incorrecto.\nEjemplo: ${pref}${command} Bad Bunny Diles`
    }, { quoted: msg });
  }

  // Reacción de carga
  await conn.sendMessage(chatId, { react: { text: "⏳", key: msg.key } });

  try {
    // Llamada a Neoxr API
    const res = await axios.get(API_BASE, {
      params: { q: query, apikey: API_KEY }
    });

    const data = res.data?.data;

    if (!res.data?.status || !data?.url) {
      return conn.sendMessage(chatId, {
        text: "❌ No se encontró la canción. Prueba con otro nombre."
      }, { quoted: msg });
    }

    // Descarga el audio temporalmente
    const tmpDir = path.join(__dirname, "../tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const inFile = path.join(tmpDir, `song_${Date.now()}${path.extname(data.url)}`);
    await downloadToFile(data.url, inFile);

    // Transcodificar si no es mp3
    let outFile = inFile;
    if (path.extname(inFile).toLowerCase() !== ".mp3") {
      outFile = await transcodeToMp3(inFile);
      try { fs.unlinkSync(inFile); } catch {}
    }

    const sizeMB = fileSizeMB(outFile);
    if (sizeMB > 99) {
      try { fs.unlinkSync(outFile); } catch {}
      return conn.sendMessage(chatId, {
        text: `❌ El archivo pesa ${sizeMB.toFixed(2)}MB (>99MB).`
      }, { quoted: msg });
    }

    // Mensaje de opciones
    const caption = `🎵 ${data.title || "Canción"}\nArtista: ${data.artist || "Desconocido"}\nDuración: ${data.duration || "Desconocida"}`;

    const preview = await conn.sendMessage(chatId, {
      image: { url: data.thumbnail },
      caption: caption
    }, { quoted: msg });

    // Guardar job temporal
    const pending = {};
    pending[preview.key.id] = { outFile, title: data.title, chatId, quoted: msg };

    // Escucha respuestas
    if (!conn._playListener) {
      conn._playListener = true;
      conn.ev.on("messages.upsert", async ev => {
        for (const m of ev.messages) {
          const ctx = m.message?.extendedTextMessage?.contextInfo;
          const replyTo = ctx?.stanzaId;
          if (replyTo && pending[replyTo]) {
            const job = pending[replyTo];
            const text = (m.message?.conversation || "").trim().toLowerCase();

            const asDoc = text === "2" || text === "documento";
            await conn.sendMessage(job.chatId, { react: { text: asDoc ? "📄" : "🎵", key: m.key } });

            const buffer = fs.readFileSync(job.outFile);
            await conn.sendMessage(job.chatId, {
              [asDoc ? "document" : "audio"]: buffer,
              mimetype: "audio/mpeg",
              fileName: `${job.title || "song"}.mp3`
            }, { quoted: job.quoted });

            try { fs.unlinkSync(job.outFile); } catch {}
            delete pending[replyTo];
          }
        }
      });
    }

    await conn.sendMessage(chatId, { react: { text: "✅", key: msg.key } });

  } catch (err) {
    console.error("❌ Error al usar Neoxr API:", err);
    await conn.sendMessage(chatId, {
      text: `❌ Error: ${err.message}`
    }, { quoted: msg });
    await conn.sendMessage(chatId, { react: { text: "❌", key: msg.key } });
  }
};

handler.command = ["play", "ytplay", "ytmp3"];
module.exports = handler;
