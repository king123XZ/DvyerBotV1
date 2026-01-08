const axios = require("axios");

const ADONIX_API = "https://api-adonix.ultraplus.click/download/ytvideo";
const ADONIX_KEY = "dvyer";

const SKY_API_RESOLVE = "https://api-sky.ultraplus.click/youtube-mp4/resolve";
const SKY_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";

module.exports = {
  command: ["ytvideo"],
  category: "downloader",

  run: async (client, m, args) => {
    let url = args[0];
    let qualityArg = args[1]; // 144, 240, 360 si se selecciona botón

    if (!url || !url.startsWith("http")) {
      return m.reply("❌ Enlace de YouTube no válido.");
    }

    // 🏠 Detectar hosting (Sky o Adonix)
    const hosting = global.hosting || "otro";

    // 🌐 SI ES SKY → mostrar botones y descargar con POST
    if (hosting === "sky") {

      // Si no hay calidad seleccionada, mostrar botones
      if (!qualityArg) {
        const buttons = [
          { buttonId: `.ytvideo ${url} 144`, buttonText: { displayText: "📱 144p" }, type: 1 },
          { buttonId: `.ytvideo ${url} 240`, buttonText: { displayText: "📱 240p" }, type: 1 },
          { buttonId: `.ytvideo ${url} 360`, buttonText: { displayText: "🎬 360p" }, type: 1 }
        ];

        return client.sendMessage(
          m.chat,
          {
            text: "📥 *Selecciona la calidad del video:*",
            footer: "dvyer - Kali • SkyHosting",
            buttons: buttons,
            headerType: 1
          },
          { quoted: m }
        );
      }

      // Si ya se seleccionó calidad → descargar desde Sky
      try {
        await m.reply(`⬇️ Descargando video en ${qualityArg}p usando API de Sky...`);

        const res = await axios.post(
          SKY_API_RESOLVE,
          { url: url, type: "video", quality: qualityArg },
          {
            headers: {
              "Content-Type": "application/json",
              "apikey": SKY_KEY
            },
            timeout: 60000
          }
        );

        const videoUrl = res.data?.media?.dl_download;
        if (!videoUrl) throw new Error("No se pudo generar el enlace de descarga.");

        await client.sendMessage(
          m.chat,
          {
            video: { url: videoUrl },
            mimetype: "video/mp4",
            fileName: res.data.title || `video-${qualityArg}p.mp4`,
            caption: `✅ Video descargado usando API de Sky`
          },
          { quoted: m }
        );

      } catch (err) {
        console.error("YTVIDEO SKY ERROR:", err.response?.data || err.message);
        return m.reply("❌ Error al descargar el video desde Sky.");
      }

      return;
    }

    // 🌍 OTRO HOST → Descarga directa con Adonix
    try {
      await m.reply("⬇️ Descargando video usando API de Adonix...");

      const res = await axios.get(
        `${ADONIX_API}?url=${encodeURIComponent(url)}&apikey=${ADONIX_KEY}`,
        { timeout: 60000 }
      );

      if (!res.data?.status || !res.data?.data?.url) {
        throw new Error("API inválida");
      }

      await client.sendMessage(
        m.chat,
        {
          video: { url: res.data.data.url },
          mimetype: "video/mp4",
          fileName: res.data.data.title || "video.mp4",
          caption: `✅ Video descargado usando API de Adonix`
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("YTVIDEO ADONIX ERROR:", err.response?.data || err.message);
      m.reply("❌ Error al descargar el video.");
    }
  }
};

