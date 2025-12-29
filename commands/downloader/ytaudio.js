const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");

module.exports = {
  command: ["ytaudio"],
  description: "Descarga audio MP3 de YouTube",
  category: "downloader",
  use: "ytaudio <link o nombre>",

  run: async (client, m, args) => {
    try {
      if (!args.length) return m.reply("❌ Ingresa un link o nombre de YouTube.");

      const processingMsg = await m.reply("⏳ Procesando audio...");

      let videoUrl = args.join(" ");
      if (!videoUrl.startsWith("http")) {
        const search = await yts(videoUrl);
        if (!search.videos.length) return m.reply("❌ No se encontraron resultados.");
        videoUrl = search.videos[0].url;
      }

      const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";

      const { data } = await axios.post(
        "https://api-sky.ultraplus.click/youtube-mp3",
        { url: videoUrl },
        { headers: { "Content-Type": "application/json", apikey: API_KEY } }
      );

      if (!data.status) return m.reply("❌ La API no pudo procesar el audio.");

      const result = data.result;
      const audioUrl = result?.media?.audio;
      if (!audioUrl) return m.reply("❌ No se pudo obtener el audio.");

      // Obtener tamaño del audio
      const head = await axios.head(audioUrl);
      const fileSize = parseInt(head.headers['content-length'] || 0);

      // Descarga temporal si el archivo es grande
      let tempFilePath = null;
      if (fileSize > 16 * 1024 * 1024) {
        tempFilePath = path.join(__dirname, `../tmp/${Date.now()}-${result.title}.mp3`);
        const writer = fs.createWriteStream(tempFilePath);
        const response = await axios.get(audioUrl, { responseType: "stream" });
        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
          writer.on("finish", resolve);
          writer.on("error", reject);
        });
      }

      // Enviar audio o documento según tamaño
      if (fileSize <= 16 * 1024 * 1024) {
        await client.sendMessage(
          m.chat,
          {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg",
            fileName: `${result.title}.mp3`,
          },
          { quoted: m }
        );
      } else {
        await client.sendMessage(
          m.chat,
          {
            document: { url: tempFilePath },
            mimetype: "audio/mpeg",
            fileName: `${result.title}.mp3`,
          },
          { quoted: m }
        );
        fs.unlinkSync(tempFilePath); // eliminar archivo temporal
      }

      // Opcional: borrar mensaje de "procesando"
      if (processingMsg.key) {
        await client.sendMessage(m.chat, { delete: processingMsg.key });
      }

    } catch (err) {
      console.error("YTAUDIO ERROR:", err.response?.data || err.message);
      m.reply("❌ Ocurrió un error al descargar el audio. Intenta nuevamente.");
    }
  }
};
