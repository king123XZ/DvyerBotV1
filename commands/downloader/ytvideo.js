const axios = require("axios");

/* ================= APIS ================= */

// SKY
const SKY_API = "https://api-sky.ultraplus.click/youtube-mp4/resolve";
const SKY_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";

// ADONIX
const ADONIX_API = "https://api-adonix.ultraplus.click/download/ytvideo";
const ADONIX_KEY = "AdonixKeythtnjs6661";

/* ================ CONFIG ================= */

const MAX_VIDEO_MB = 80; // WhatsApp seguro para video

module.exports = {
  command: ["ytvideo"],
  category: "downloader",

  run: async (client, m, args) => {
    const url = args[0];

    if (!url || !url.startsWith("http")) {
      return m.reply("❌ Enlace de YouTube no válido.");
    }

    /* ==================================================
       🏠 SKY HOST → BOTONES DE CALIDAD
    ================================================== */
    if (global.botHost === "sky") {
      global.ytCache = global.ytCache || {};
      global.ytCache[m.sender] = {
        url,
        time: Date.now()
      };

      return client.sendMessage(
        m.chat,
        {
          text: "📥 *Selecciona la calidad del video:*",
          footer: "Killua-Bot • SkyHosting",
          buttons: [
            { buttonId: ".ytq 144", buttonText: { displayText: "📱 144p" }, type: 1 },
            { buttonId: ".ytq 240", buttonText: { displayText: "📱 240p" }, type: 1 },
            { buttonId: ".ytq 360", buttonText: { displayText: "🎬 360p" }, type: 1 }
          ],
          headerType: 1
        },
        { quoted: m }
      );
    }

    /* ==================================================
       🌍 OTRO HOST → ADONIX AUTOMÁTICO
    ================================================== */
    try {
      await m.reply(
        "⬇️ Descargando video...\n" +
        "🎥 Calidad automática\n" +
        "⏳ Verificando compatibilidad."
      );

      const res = await axios.get(
        `${ADONIX_API}?url=${encodeURIComponent(url)}&apikey=${ADONIX_KEY}`,
        { timeout: 60000 }
      );

      const data = res.data?.data;
      if (!res.data?.status || !data?.url) {
        throw new Error("ADONIX_INVALID_RESPONSE");
      }

      // 🔍 Verificar tamaño real
      const head = await axios.head(data.url, { timeout: 15000 });
      const sizeBytes = Number(head.headers["content-length"] || 0);
      const sizeMB = sizeBytes / (1024 * 1024);

      const safeTitle = (data.title || "video")
        .replace(/[\\/:*?"<>|]/g, "")
        .slice(0, 60);

      // 🎬 VIDEO (solo si es seguro)
      if (sizeMB > 0 && sizeMB <= MAX_VIDEO_MB) {
        return client.sendMessage(
          m.chat,
          {
            video: { url: data.url },
            mimetype: "video/mp4",
            fileName: `${safeTitle}.mp4`,
            caption: `🎬 ${data.title || "Video"}`
          },
          { quoted: m }
        );
      }

      // 📄 DOCUMENTO (fallback)
      await client.sendMessage(
        m.chat,
        {
          document: { url: data.url },
          mimetype: "video/mp4",
          fileName: `${safeTitle}.mp4`,
          caption:
            `📄 *Video enviado como documento*\n` +
            `📦 Tamaño: ${sizeMB.toFixed(2)} MB`
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("YTVIDEO ERROR:", err.message);
      m.reply(
        "❌ No se pudo descargar el video.\n" +
        "⚠️ El video puede estar bloqueado o no disponible."
      );
    }
  }
};
