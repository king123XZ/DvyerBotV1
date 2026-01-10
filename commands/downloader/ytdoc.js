const axios = require("axios");

// 🤖 Bot
const BOT_NAME = "KILLUA-BOT v1.00";

// API Gawrgura
const GAW_API = "https://gawrgura-api.onrender.com/download/ytdl";

// Map para controlar usuarios con video pendiente
const pendingVideos = new Map();

module.exports = {
  command: ["ytdoc"],
  category: "downloader",
  description: "Descarga video de YouTube como documento",

  run: async (client, m, args) => {
    try {
      const userId = m.sender;

      // ⚠️ Verificar si usuario tiene un video pendiente
      if (pendingVideos.has(userId)) {
        return client.reply(
          m.chat,
          "❌ Tienes un video documento pendiente enviándose. Espera a que termine antes de pedir otro.",
          m,
          global.channelInfo
        );
      }

      const url = args[0];
      if (!url || !url.startsWith("http")) {
        return client.reply(
          m.chat,
          "❌ Uso correcto:\n.ytdoc <link de YouTube>",
          m,
          global.channelInfo
        );
      }

      // Marcar usuario como pendiente
      pendingVideos.set(userId, true);

      // Mensaje de aviso mejorado
      await client.sendMessage(
        m.chat,
        {
          text: `⏳ Tu video se está procesando y enviando…\n⚠️ Puede tardar un poco si pesa mucho.\n🤖 ${BOT_NAME}`
        },
        { quoted: m, ...global.channelInfo }
      );

      // Llamar API
      const res = await axios.get(`${GAW_API}?url=${encodeURIComponent(url)}`, { timeout: 60000 });
      const result = res.data?.result;

      if (!result || !result.mp4) {
        pendingVideos.delete(userId);
        return client.reply(
          m.chat,
          "❌ Error al obtener el video de YouTube.",
          m,
          global.channelInfo
        );
      }

      const safeTitle = (result.title || "video").replace(/[\\/:*?"<>|]/g, "").trim();

      // Enviar video como documento
      await client.sendMessage(
        m.chat,
        {
          document: { url: result.mp4 },
          mimetype: "video/mp4",
          fileName: `${safeTitle}.mp4`,
          caption: `🎬 ${result.title}\n✅ API: Gawrgura\n🤖 ${BOT_NAME}`
        },
        { quoted: m, ...global.channelInfo }
      );

      // Opcional: enviar también audio si existe
      if (result.mp3) {
        await client.sendMessage(
          m.chat,
          {
            document: { url: result.mp3 },
            mimetype: "audio/mpeg",
            fileName: `${safeTitle}.mp3`,
            caption: `🎵 Audio extraído del video\n🤖 ${BOT_NAME}`
          },
          { quoted: m, ...global.channelInfo }
        );
      }

      // Desmarcar usuario como pendiente
      pendingVideos.delete(userId);

    } catch (err) {
      console.error("YTDOC ERROR:", err.response?.data || err.message);
      pendingVideos.delete(m.sender);
      await client.reply(
        m.chat,
        "❌ Error al descargar el video.",
        m,
        global.channelInfo
      );
    }
  }
};
