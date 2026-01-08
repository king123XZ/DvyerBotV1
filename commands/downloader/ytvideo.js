const axios = require("axios");

/* ================= APIS ================= */
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

    try {
      await m.reply(
        "⬇️ Descargando video...\n" +
        "🎥 Calidad automática\n" +
        "⏳ Verificando compatibilidad."
      );

      // 🔗 Llamada a API Adonix
      const res = await axios.get(
        `${ADONIX_API}?url=${encodeURIComponent(url)}&apikey=${ADONIX_KEY}`,
        { timeout: 60000 }
      );

      const data = res.data?.data;
      if (!res.data?.status || !data?.url) {
        throw new Error("ADONIX_INVALID_RESPONSE");
      }

      // 🔍 Verificar tamaño real del video
      const head = await axios.head(data.url, { timeout: 15000 });
      const sizeBytes = Number(head.headers["content-length"] || 0);
      const sizeMB = sizeBytes / (1024 * 1024);

      const safeTitle = (data.title || "video")
        .replace(/[\\/:*?"<>|]/g, "")
        .slice(0, 60);

      // 🎬 Enviar como video si está dentro del límite
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

      // 📄 Enviar como documento si supera el límite
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
      console.error("YTVIDEO ADONIX ERROR:", err.message);
      m.reply(
        "❌ No se pudo descargar el video.\n" +
        "⚠️ El video puede estar bloqueado o no disponible."
      );
    }
  }
};
