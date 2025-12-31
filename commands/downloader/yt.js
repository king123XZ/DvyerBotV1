const axios = require("axios");
const { ytdl } = require("../../lib/ytdl");

const MAX_MB = 300; // límite seguro para bots

const cleanFileName = (text = "archivo") =>
  text.replace(/[\\/:*?"<>|]+/g, "").substring(0, 60);

module.exports = {
  command: ["yt", "ytdl"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      if (!args[0] || !args[1]) {
        return m.reply(
          `❌ Uso incorrecto\n\n` +
          `Ejemplos:\n` +
          `!yt https://youtu.be/xxxx mp3\n` +
          `!yt https://youtu.be/xxxx 360`
        );
      }

      const url = args[0];
      const format = args[1].toLowerCase();

      await m.reply("⏳ Procesando descarga, espera...");

      const res = await ytdl(url, format);
      if (res.error) return m.reply("❌ Error: " + res.error);

      // 🔍 verificar tamaño
      let sizeMB = 0;
      try {
        const head = await axios.head(res.link, { timeout: 15000 });
        sizeMB = Number(head.headers["content-length"] || 0) / 1024 / 1024;
      } catch {}

      const title = cleanFileName(res.title);

      // 🚫 archivo muy grande → enviar LINK
      if (sizeMB > MAX_MB) {
        return m.reply(
          `🎬 *${title}*\n\n` +
          `⚠️ Archivo pesado: *${sizeMB.toFixed(1)} MB*\n` +
          `📥 Descárgalo aquí:\n${res.link}`
        );
      }

      // 🎵 AUDIO → DOCUMENTO
      if (["mp3","m4a","webm","aac","flac","ogg","wav","apus"].includes(format)) {
        await client.sendMessage(
          m.chat,
          {
            document: { url: res.link },
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`
          },
          { quoted: m }
        );
      }
      // 🎬 VIDEO → DOCUMENTO
      else {
        await client.sendMessage(
          m.chat,
          {
            document: { url: res.link },
            mimetype: "video/mp4",
            fileName: `${title}.mp4`
          },
          { quoted: m }
        );
      }

    } catch (err) {
      console.error(err);
      m.reply("❌ Error inesperado al descargar");
    }
  }
};
