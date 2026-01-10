const axios = require("axios");

const API = "https://gawrgura-api.onrender.com/download/tiktok";

module.exports = {
  command: ["tiktok", "tt"],
  category: "downloader",
  description: "Descarga TikTok automáticamente (video y audio)",

  run: async (client, m, args) => {
    try {
      const url = args[0];
      if (!url || !/tiktok\.com/.test(url)) {
        return client.reply(
          m.chat,
          "❌ Enlace inválido.\nEjemplo:\n.tiktok https://www.tiktok.com/@user/video/123",
          m
        );
      }

      const msg = await client.reply(m.chat, "⏳ Descargando video y audio...", m);

      // Llamar a la API
      const res = await axios.get(`${API}?url=${encodeURIComponent(url)}`);
      const result = res.data?.result;

      if (!result) {
        return client.reply(m.chat, "❌ Error al descargar TikTok.", m);
      }

      // Enviar video
      await client.sendMessage(
        m.chat,
        { video: { url: result.video_nowm }, mimetype: "video/mp4", fileName: "tiktok.mp4" },
        { quoted: m }
      );

      // Enviar audio
      await client.sendMessage(
        m.chat,
        { audio: { url: result.audio_url }, mimetype: "audio/mpeg", ptt: false },
        { quoted: m }
      );

      // Borrar mensaje temporal
      await client.deleteMessage(m.chat, { id: msg.key.id, remoteJid: m.chat });

    } catch (err) {
      console.error("TIKTOK DOWNLOAD ERROR:", err);
      client.reply(m.chat, "❌ Error al descargar TikTok.", m);
    }
  }
};
