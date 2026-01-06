const axios = require("axios");

module.exports = {
  command: ["ytvideo"],
  category: "downloader",

  run: async (client, m, args) => {
    const url = args[0];
    if (!url || !url.startsWith("http")) {
      return m.reply("❌ Enlace de YouTube no válido.");
    }

    await m.reply("⬇️ Descargando video de YouTube...");

    // Array de calidades a intentar de mayor a menor
    const qualities = ["480", "240"];

    let downloaded = false;

    for (let i = 0; i < qualities.length; i++) {
      try {
        const res = await axios.get(`https://api-sky.ultraplus.click/youtube/download?url=${encodeURIComponent(url)}&quality=${qualities[i]}`, {
          headers: { apikey: "sk_f606dcf6-f301-4d69-b54b-505c12ebec45" },
          responseType: "json",
          timeout: 20000 // 20 segundos de espera
        });

        const videoUrl = res.data?.result?.url;
        if (!videoUrl) continue;

        await client.sendMessage(
          m.chat,
          {
            video: { url: videoUrl },
            mimetype: "video/mp4",
            fileName: `youtube_${qualities[i]}p.mp4`,
            caption: `🎬 Descargado en ${qualities[i]}p`,
          },
          { quoted: m }
        );

        downloaded = true;
        break; // si funcionó, salimos del bucle
      } catch (err) {
        console.log(`Fallo en ${qualities[i]}p, intentando otra calidad...`, err.message || err);
      }
    }

    if (!downloaded) {
      m.reply("❌ No se pudo descargar el video en ninguna calidad.");
    }
  }
};
