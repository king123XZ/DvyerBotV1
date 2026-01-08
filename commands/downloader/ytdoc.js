const axios = require("axios");

// 🔵 SKY
const SKY_API = "https://api-sky.ultraplus.click/youtube-mp4/resolve";
const SKY_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";

// 🟢 ADONIX
const ADONIX_API = "https://api-adonix.ultraplus.click/download/ytvideo";
const ADONIX_KEY = "AdonixKeythtnjs6661";

const QUALITY_ORDER = ["360", "240", "144"];
const MAX_SIZE_MB = 1700;

module.exports = {
  command: ["ytdoc"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      const url = args[0];
      if (!url || !url.startsWith("http")) {
        return m.reply("❌ Usa:\n.ytdoc <link de YouTube>");
      }

      // 🏠 SKY HOST → CALIDAD AUTOMÁTICA
      if (global.botHost === "sky") {
        await m.reply(
          "⬇️ Descargando video...\n" +
          "🎥 Calidad automática (hasta 360p)\n" +
          "⏳ Esto puede tardar unos segundos."
        );

        let data, link, usedQuality;

        for (const quality of QUALITY_ORDER) {
          try {
            const res = await axios.post(
              SKY_API,
              { url, type: "video", quality },
              { headers: { apikey: SKY_KEY }, timeout: 60000 }
            );

            data = res.data?.result;
            link = data?.media?.direct;

            if (link) {
              usedQuality = quality;
              break;
            }
          } catch {}
        }

        if (!link) {
          return m.reply("❌ No se pudo generar el video.");
        }

        // 🔍 tamaño
        const head = await axios.head(link);
        const sizeMB = Number(head.headers["content-length"] || 0) / (1024 * 1024);

        if (sizeMB > MAX_SIZE_MB) {
          return m.reply(
            `⚠️ Archivo muy pesado\n\n📦 ${sizeMB.toFixed(2)} MB\n📛 Límite: ${MAX_SIZE_MB} MB`
          );
        }

        const safeTitle = data.title.replace(/[\\/:*?"<>|]/g, "");
        const fileName = `${safeTitle} - ${usedQuality}p.mp4`;

        return client.sendMessage(
          m.chat,
          {
            document: { url: link },
            mimetype: "video/mp4",
            fileName,
            caption:
              `🎬 ${data.title}\n` +
              `📺 Calidad: ${usedQuality}p\n` +
              `📦 Tamaño: ${sizeMB.toFixed(2)} MB\n\n` +
              "KILLUA-BOT V1.00"
          },
          { quoted: m }
        );
      }

      // 🌍 OTRO HOST → ADONIX (SIN CALIDAD)
      await m.reply("⬇️ Descargando video (calidad disponible)...");

      const res = await axios.get(
        `${ADONIX_API}?url=${encodeURIComponent(url)}&apikey=${ADONIX_KEY}`,
        { timeout: 60000 }
      );

      if (!res.data?.status || !res.data?.data?.url) {
        throw new Error("API inválida");
      }

      const fileUrl = res.data.data.url;
      const title = (res.data.data.title || "video")
        .replace(/[\\/:*?"<>|]/g, "");

      await client.sendMessage(
        m.chat,
        {
          document: { url: fileUrl },
          mimetype: "video/mp4",
          fileName: `${title}.mp4`,
          caption: "🎬 Video descargado\nKILLUA-BOT V1.00"
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("YTDOC ERROR:", err);
      m.reply("❌ Ocurrió un error al descargar el video.");
    }
  }
};
