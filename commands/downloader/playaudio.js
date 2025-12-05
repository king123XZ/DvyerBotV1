// commands/play.js
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const { pipeline } = require("stream");
const streamPipe = promisify(pipeline);

const API_URL = "https://api.neoxr.eu/api/play";
const API_KEY = "zMqDtV";

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

async function sendAudio(conn, job, asDoc, triggerMsg) {
  const { chatId, audioUrl, title, quoted } = job;
  const tmpDir = path.resolve("./tmp");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const inFile = path.join(tmpDir, `${Date.now()}_song.mp3`);

  await downloadToFile(audioUrl, inFile);

  if (fileSizeMB(inFile) > 99) {
    await conn.sendMessage(chatId, { text: `❌ Archivo demasiado grande (>99MB).` }, { quoted });
    return;
  }

  const buffer = fs.readFileSync(inFile);
  await conn.sendMessage(chatId, {
    [asDoc ? "document" : "audio"]: buffer,
    mimetype: "audio/mpeg",
    fileName: `${title}.mp3`
  }, { quoted });

  try { fs.unlinkSync(inFile); } catch {}
}

module.exports = {
  command: ["play"],
  description: "Busca y descarga audio usando Neoxr API",
  run: async (msg, { conn, args }) => {
    const chatId = msg.key.remoteJid;
    const pref = global.prefixes?.[0] || ".";
    const query = args.join(" ");

    if (!query) {
      return conn.sendMessage(chatId, {
        text: `⚠️ Uso:\n${pref}play <nombre de la canción>\nEj: ${pref}play Komang`
      }, { quoted: msg });
    }

    await conn.sendMessage(chatId, { react: { text: "⏳", key: msg.key } });

    try {
      const res = await axios.get(API_URL, { params: { q: query, apikey: API_KEY }, timeout: 60000 });
      const data = res.data?.data;

      if (!res.data?.status || !data || !data.url) {
        throw new Error("No se encontró la canción o API inválida.");
      }

      const { title, artist, url: audioUrl, thumbnail, duration } = data;
      const caption =
        `🎵 𝙎𝙤𝙣𝙜 𝙁𝙤𝙪𝙣𝙙\n` +
        `✦ Título: ${title}\n` +
        `✦ Artista: ${artist}\n` +
        `✦ Duración: ${duration || "Desconocida"}\n\n` +
        `Reacciona 👍 para Audio, ❤️ para Documento`;

      const preview = await conn.sendMessage(chatId, {
        image: { url: thumbnail },
        caption
      }, { quoted: msg });

      pending[preview.key.id] = { chatId, audioUrl, title, quoted: msg };

      if (!conn._playListener) {
        conn._playListener = true;
        conn.ev.on("messages.upsert", async ev => {
          for (const m of ev.messages) {
            try {
              const ctx = m.message?.extendedTextMessage?.contextInfo;
              const replyTo = ctx?.stanzaId;
              const textLow = (m.message?.conversation || "").trim().toLowerCase();

              // Reacciones
              if (m.message?.reactionMessage) {
                const { key: reactKey, text: emoji } = m.message.reactionMessage;
                const job = pending[reactKey.id];
                if (job) {
                  const asDoc = emoji === "❤️";
                  await sendAudio(conn, job, asDoc, m);
                  delete pending[reactKey.id];
                }
              }

              // Respuestas 1/2
              if (replyTo && pending[replyTo]) {
                const job = pending[replyTo];
                if (textLow === "1" || textLow === "audio") {
                  await sendAudio(conn, job, false, m);
                  delete pending[replyTo];
                } else if (textLow === "2" || textLow === "doc" || textLow === "documento") {
                  await sendAudio(conn, job, true, m);
                  delete pending[replyTo];
                } else {
                  await conn.sendMessage(job.chatId, {
                    text: "⚠️ Responde con *1* (Audio) o *2* (Documento), o reacciona 👍 / ❤️."
                  }, { quoted: job.quoted });
                }
              }
            } catch (e) {
              console.error("Error listener play:", e);
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
  }
};


