const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45"; // reemplaza con tu API key

module.exports = {
  command: ["ytvideo"],
  category: "downloader",

  run: async (client, m, args) => {
    const url = args[0];

    if (!url || !url.startsWith("http")) {
      return m.reply("❌ Enlace de YouTube no válido.");
    }

    await m.reply("⬇️ Descargando video de YouTube en la mejor calidad disponible (hasta 360p)...");

    // Intentamos 360p primero, luego 240p, y finalmente 144p
    const qualities = ["360", "240", "144"];
    let downloaded = false;

    for (let q of qualities) {
      try {
        const res = await axios.post(
          "https://api-sky.ultraplus.click/youtube-mp4",
          { url, quality: q },
          { headers: { apikey: API_KEY } }
        );

        const videoUrl = res.data?.result?.url;
        if (!videoUrl) continue;

        await client.sendMessage(
          m.chat,
          {
            video: { url: videoUrl },
            mimetype: "video/mp4",
            fileName: `youtube_${q}p.mp4`,
            caption: `🎬 Descargado en ${q}p`,
          },
          { quoted: m }
        );

        downloaded = true;
        break; // salió bien, no intentamos más calidades
      } catch (err) {
        console.log(`Fallo al descargar en ${q}p, intentando otra calidad...`, err.message || err);
      }
    }

    if (!downloaded) {
      m.reply("❌ No se pudo descargar el video en ninguna calidad disponible.");
    }
  }
};

