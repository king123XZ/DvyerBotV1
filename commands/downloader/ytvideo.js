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

// Tu canal de WhatsApp
const MY_CHANNEL = "https://whatsapp.com/channel/0029VaH4xpUBPzjendcoBI2c";

module.exports = {
  command: ["ytvideo"],
  category: "downloader",

  run: async (client, m, args) => {
    const url = args[0];
    const hosting = global.hosting || "otro";

    if (!url || !url.startsWith("http")) {
      return m.reply("❌ Enlace de YouTube no válido.");
    }

    // Inicializar cache
    global.ytCache = global.ytCache || {};

    // ----------------------
    // SKY HOST
    // ----------------------
    if (hosting === "sky") {

      // Mostrar botones si no se eligió calidad
      if (!args[1]) {
        global.ytCache[m.sender] = { url: url, time: Date.now() };

        // Botones de calidad + botón "Ver canal"
        const buttons = SKY_QUALITIES.map(q => ({
          buttonId: `.ytvideo ${url} ${q}`,
          buttonText: { displayText: `🎬 ${q}p` },
          type: 1
        }));

        const buttonUrl = [
          {
            url: MY_CHANNEL,
            displayText: "📢 Ver canal"
          }
        ];

        return client.sendMessage(
          m.chat,
          {
            text: "📥 *Selecciona la calidad del video:*",
            footer: "Killua-Bot-Dev • api-sky.ultraplus",
            buttons: buttons,
            headerType: 1,
            templateButtons: buttonUrl
          },
          { quoted: m }
        );
      }

      // ----------------------
      // Descargar video según calidad
      // ----------------------
      const quality = args[1];
      const cache = global.ytCache[m.sender];
      if (!cache) return m.reply("❌ Cache no encontrada. Usa `.ytvideo <url>` primero.");
      if (!SKY_QUALITIES.includes(quality)) return m.reply(`❌ Calidad no permitida. Usa: ${SKY_QUALITIES.join(", ")}`);

      try {
        await m.reply(`⬇️ Descargando video en ${quality}p usando api-sky.ultraplus...`);

        // Registrar video
        await axios.post(
          SKY_API_REGISTER,
          { url: cache.url },
          { headers: { apikey: SKY_KEY, "Content-Type": "application/json" } }
        );

        // Generar link
        const res = await axios.post(
          SKY_API_RESOLVE,
          { url: cache.url, type: "video", quality },
          { headers: { apikey: SKY_KEY, "Content-Type": "application/json" }, timeout: 60000 }
        );

        const videoUrl = res.data?.result?.media?.direct;
        if (!videoUrl) throw new Error("No se pudo generar el enlace de descarga.");

        // Enviar video con botón real "Ver canal"
        const templateButton = [
          { url: MY_CHANNEL, displayText: "📢 Ver canal" }
        ];

        await client.sendMessage(
          m.chat,
          {
            video: { url: videoUrl },
            mimetype: "video/mp4",
            fileName: res.data.result?.title || `video-${quality}p.mp4`,
            caption: `✅ Video descargado usando api-sky.ultraplus\n📺 Calidad: ${quality}p`,
            footer: "Killua-Bot-Dev",
            templateButtons: templateButton,
            headerType: 5
          },
          { quoted: m }
        );

      } catch (err) {
        console.error("YTVIDEO SKY ERROR:", err.response?.data || err.message);

        // fallback automático
        const nextQuality = SKY_QUALITIES.find(q => q !== quality);
        if (nextQuality) {
          return client.sendMessage(m.chat, {
            text: `⚠️ *${quality}p falló*\n🔁 Probando automáticamente *${nextQuality}p*...`
          }, { quoted: m }).then(() => {
            client.emit("message", {
              key: m.key,
              message: { conversation: `.ytvideo ${cache.url} ${nextQuality}` },
              sender: m.sender
            });
          });
        }

        m.reply("❌ No se pudo descargar el video en ninguna calidad.");
      } finally {
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
          caption: `✅ Video descargado usando API de Adonix`,
          footer: "Killua-Bot-Dev",
          templateButtons: [
            { url: MY_CHANNEL, displayText: "📢 Ver canal" }
          ],
          headerType: 5
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("YTVIDEO ADONIX ERROR:", err.response?.data || err.message);
      m.reply("❌ Error al descargar el video.");
    }
  }
};

