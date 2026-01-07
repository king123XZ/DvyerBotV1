const axios = require("axios");
const yts = require("yt-search");

module.exports = {
  command: ["ytmp3"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      if (!args.length) {
        return m.reply("❌ Ingresa un enlace o nombre del video.");
      }

      await m.reply("⏳ Descargando audio (documento)...");

      let videoUrl = args.join(" ");
      let title = "audio";

      // 🔎 Buscar si no es link
      if (!videoUrl.startsWith("http")) {
        const search = await yts(videoUrl);
        if (!search.videos.length) {
          return m.reply("❌ No se encontraron resultados.");
        }
        videoUrl = search.videos[0].url;
        title = search.videos[0].title;
      }

      title = title.replace(/[\\/:*?"<>|]/g, "").slice(0, 60);

      // 🎧 API gawrgura
      const apiUrl = `https://gawrgura-api.onrender.com/download/ytmp3?url=${encodeURIComponent(videoUrl)}`;
      const { data } = await axios.get(apiUrl);

      if (!data.status || !data.result) {
        return m.reply("❌ Error al obtener el audio.");
      }

      // ⬇️ DESCARGAR ARCHIVO
      const file = await axios.get(data.result, {
        responseType: "arraybuffer",
        timeout: 120000
      });

      // 📄 ENVIAR COMO DOCUMENTO (CLAVE)
      await client.sendMessage(
        m.chat,
        {
          document: Buffer.from(file.data),
          mimetype: "application/octet-stream",
          fileName: `${title}.mp3`
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("YTMP3 DOCUMENT ERROR:", err);
      m.reply("❌ Error al descargar el audio.");
    }
  }
};
