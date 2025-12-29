const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");

module.exports = {
  command: ["ytaudio"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      if (!args.length) return m.reply("❌ Ingresa un link o nombre de YouTube.");

      await m.reply("⏳ Procesando audio...");

      let videoUrl = args.join(" ");
      if (!videoUrl.startsWith("http")) {
        const search = await yts(videoUrl);
        if (!search.videos.length) return m.reply("❌ No se encontraron resultados.");
        videoUrl = search.videos[0].url;
      }

      const { data } = await axios.post(
        "https://api-sky.ultraplus.click/youtube-mp3",
        { url: videoUrl },
        { headers: { apikey: "sk_f606dcf6-f301-4d69-b54b-505c12ebec45" } }
      );

      if (!data.status) return m.reply("❌ No se pudo procesar el audio.");

      const audioUrl = data.result?.media?.audio;
      const title = data.result?.title || "audio";

      if (!audioUrl) return m.reply("❌ Audio no disponible.");

      // 🔹 LIMPIAR NOMBRE DEL ARCHIVO
      const safeTitle = title.replace(/[\\/:*?"<>|]/g, "");
      const tmpDir = path.join(__dirname, "../tmp");

      // 🔹 CREAR CARPETA TMP SI NO EXISTE
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

      const filePath = path.join(tmpDir, `${Date.now()}-${safeTitle}.mp3`);

      // 🔹 OBTENER TAMAÑO
      const head = await axios.head(audioUrl);
      const sizeMB = Number(head.headers["content-length"] || 0) / 1024 / 1024;

      // 🔹 AUDIO NORMAL (<16MB)
      if (sizeMB <= 16) {
        return await client.sendMessage(
          m.chat,
          {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg",
            fileName: `${safeTitle}.mp3`,
          },
          { quoted: m }
        );
      }

      // 🔹 AUDIO GRANDE → DOCUMENTO
      const stream = await axios.get(audioUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(filePath);
      stream.data.pipe(writer);

      await new Promise((res, rej) => {
        writer.on("finish", res);
        writer.on("error", rej);
      });

      await client.sendMessage(
        m.chat,
        {
          document: fs.readFileSync(filePath),
          mimetype: "audio/mpeg",
          fileName: `${safeTitle}.mp3`,
        },
        { quoted: m }
      );

      fs.unlinkSync(filePath); // limpiar

    } catch (err) {
      console.error("YTAUDIO ERROR:", err);
      m.reply("❌ Error al descargar el audio. Intenta otro video.");
    }
  }
};
