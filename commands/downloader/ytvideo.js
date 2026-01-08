const axios = require("axios");

// Adonix
const ADONIX_API = "https://api-adonix.ultraplus.click/download/ytvideo";
const ADONIX_KEY = "dvyer";

// Sky
const SKY_API_REGISTER = "https://api-sky.ultraplus.click/youtube-mp4";
const SKY_API_RESOLVE = "https://api-sky.ultraplus.click/youtube-mp4/resolve";
const SKY_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";

// Calidades permitidas para Sky
const SKY_QUALITIES = ["360", "720"];

module.exports = {
  command: ["ytvideo"],
  category: "downloader",

  run: async (client, m, args) => {
    let url = args[0];
    const hosting = global.hosting || "otro";

    if (!url || !url.startsWith("http")) {
      return m.reply("❌ Enlace de YouTube no válido.");
    }

    // ----------------------
    // SKY HOST
    // ----------------------
    if (hosting === "sky") {

      // Iniciar cache para este usuario si no existe
      global.ytCache = global.ytCache || {};
      if (!args[1]) {
        // guardar URL en cache
        global.ytCache[m.sender] = { url: url, time: Date.now() };

        // mostrar botones de calidad
        const buttons = SKY_QUALITIES.map(q => ({
          buttonId: `.ytq ${q}`,
          buttonText: { displayText: `🎬 ${q}p` },
          type: 1
        }));

        return client.sendMessage(
          m.chat,
          {
            text: "📥 *Selecciona la calidad del video:*",
            footer: "dvyer • api-sky.ultraplus",
            buttons: buttons,
            headerType: 1
          },
          { quoted: m }
        );
      }

      // ----------------------
      // Descarga con calidad seleccionada
      // ----------------------
      const quality = args[1];
      const cache = global.ytCache[m.sender];
      if (!cache) return m.reply("❌ Cache no encontrada. Usa `.ytvideo <url>` primero.");
      if (!SKY_QUALITIES.includes(quality)) return m.reply(`❌ Calidad no permitida. Usa: ${SKY_QUALITIES.join(", ")}`);

      try {
        await m.reply(`⬇️ Descargando video en ${quality}p usando api-sky.ultraplus...`);

        // 1️⃣ Registrar video
        await axios.post(
          SKY_API_REGISTER,
          { url: cache.url },
          { headers: { apikey: SKY_KEY, "Content-Type": "application/json" } }
        );

        // 2️⃣ Generar link
        const res = await axios.post(
          SKY_API_RESOLVE,
          { url: cache.url, type: "video", quality: quality },
          { headers: { apikey: SKY_KEY, "Content-Type": "application/json" }, timeout: 60000 }
        );

        const videoUrl = res.data?.result?.media?.direct;
        if (!videoUrl) throw new Error("No se pudo generar el enlace de descarga.");

        // enviar video
        await client.sendMessage(
          m.chat,
          {
            video: { url: videoUrl },
            mimetype: "video/mp4",
            fileName: res.data.result?.title || `video-${quality}p.mp4`,
            caption: `✅ Video descargado usando api-sky.ultraplus\n📺 Calidad: ${quality}p`
          },
          { quoted: m }
        );

      } catch (err) {
        console.error("YTVIDEO SKY ERROR:", err.response?.data || err.message);

        // fallback automático a otra calidad
        const nextQuality = SKY_QUALITIES.find(q => q !== quality);
        if (nextQuality) {
          return client.sendMessage(m.chat, {
            text: `⚠️ *${quality}p falló*\n🔁 Probando automáticamente *${nextQuality}p*...`
          }, { quoted: m }).then(() => {
            client.emit("message", {
              key: m.key,
              message: { conversation: `.ytq ${nextQuality}` },
              sender: m.sender
            });
          });
        }

        m.reply("❌ No se pudo descargar el video en ninguna calidad.");
      } finally {
        // limpiar cache
        delete global.ytCache[m.sender];
      }

      return;
    }

    // ----------------------
    // OTRO HOST → Adonix
    // ----------------------
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
