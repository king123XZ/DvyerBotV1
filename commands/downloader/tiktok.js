const fetch = require('node-fetch');

module.exports = {
  command: ["tiktok", "tt"],
  description: "Descarga videos de TikTok usando tu API",
  category: "downloader",
  use: "https://www.tiktok.com/",
  run: async (client, m, args) => {
    if (!args[0]) {
      return m.reply(
        "Ingresa el *enlace* de un video de *TikTok*\n\n`Ejemplo`\n!tiktok https://www.tiktok.com/@user/video/123"
      );
    }

    await m.reply("🕑 Procesando tu video...");

    try {
      let videoUrl = args[0];

      // Si es un enlace corto, resolvemos la URL final
      if (videoUrl.includes("vm.tiktok.com")) {
        const res = await fetch(videoUrl, { redirect: "follow" });
        videoUrl = res.url;
      }

      const apiKey = "AvTYmkABPtmG";

      const res = await fetch(
        `https://api-sky.ultraplus.click/api/download/tiktok.js?url=${encodeURIComponent(videoUrl)}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
          }
        }
      );

      if (!res.ok) {
        return m.reply("❌ Error al conectar con la API de TikTok");
      }

      const data = await res.json();

      // Buscamos URL de video
      const downloadUrl = data.url || data.result?.url || data.downloadUrl;

      if (!downloadUrl) {
        console.log("Respuesta completa de la API:", data); // Para depuración
        return m.reply("❌ No se pudo obtener el video. Verifica el enlace o intenta con otro.");
      }

      const caption = `TikTok Downloader\n\nTítulo: ${data.title || "Desconocido"}`;

      await client.sendMessage(
        m.chat,
        {
          video: { url: downloadUrl },
          caption,
          mimetype: "video/mp4",
          fileName: "tiktok.mp4"
        },
        { quoted: m }
      );

    } catch (e) {
      console.error("Error en TikTok:", e);
      m.reply("❌ Ocurrió un error al procesar el video de TikTok");
    }
  },
};

