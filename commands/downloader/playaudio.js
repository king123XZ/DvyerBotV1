const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const { promisify } = require("util");
const { pipeline } = require("stream");
const streamPipe = promisify(pipeline);

const API_KEY = "zMqDtV";
const API_BASE = "https://api.neoxr.eu/api/play";

async function downloadToFile(url, filePath) {
  const res = await axios.get(url, { responseType: "stream" });
  await streamPipe(res.data, fs.createWriteStream(filePath));
  return filePath;
}

function fileSizeMB(filePath) {
  const b = fs.statSync(filePath).size;
  return b / (1024 * 1024);
}

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

const handler = async (client, m, args) => {
  const chatId = m.chat || m.key.remoteJid;
  const query = args.join(" ").trim();
  const pref = global.prefixes?.[0] || ".";

  if (!query) {
    return client.sendMessage(chatId, { text: `⚠️ Uso incorrecto.\nEjemplo: ${pref}play Bad Bunny Diles` }, { quoted: m });
  }

  await client.sendMessage(chatId, { react: { text: "⏳", key: m.key } });

  try {
    const res = await axios.get(API_BASE, { params: { q: query, apikey: API_KEY } });
    const data = res.data?.data;
    if (!res.data?.status || !data?.url) return client.sendMessage(chatId, { text: "❌ No se encontró la canción." }, { quoted: m });

    const tmpDir = path.join(__dirname, "../tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const inFile = path.join(tmpDir, `song_${Date.now()}${path.extname(data.url)}`);
    await downloadToFile(data.url, inFile);

    let outFile = inFile;
    if (path.extname(inFile).toLowerCase() !== ".mp3") {
      outFile = await transcodeToMp3(inFile);
      try { fs.unlinkSync(inFile); } catch {}
    }

    const sizeMB = fileSizeMB(outFile);
    if (sizeMB > 99) {
      try { fs.unlinkSync(outFile); } catch {}
      return client.sendMessage(chatId, { text: `❌ El archivo pesa ${sizeMB.toFixed(2)}MB (>99MB).` }, { quoted: m });
    }

    const caption = `🎵 ${data.title || "Canción"}\nArtista: ${data.artist || "Desconocido"}\nDuración: ${data.duration || "Desconocida"}`;

    const buffer = fs.readFileSync(outFile);
    await client.sendMessage(chatId, {
      audio: buffer,
      mimetype: "audio/mpeg",
      fileName: `${data.title || "song"}.mp3`,
      caption
    }, { quoted: m });

    try { fs.unlinkSync(outFile); } catch {}
    await client.sendMessage(chatId, { react: { text: "✅", key: m.key } });

  } catch (err) {
    console.error("❌ Error al usar Neoxr API:", err);
    await client.sendMessage(chatId, { text: `❌ Error: ${err.message}` }, { quoted: m });
    await client.sendMessage(chatId, { react: { text: "❌", key: m.key } });
  }
};

module.exports = {
  run: handler,
  command: ["play", "ytplay", "ytmp3"]
};

