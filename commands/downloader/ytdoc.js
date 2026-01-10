const axios = require("axios");

// 🤖 Bot
const BOT_NAME = "KILLUA-BOT v1.00";

// API Gawrgura
const GAW_API = "https://gawrgura-api.onrender.com/download/ytdl";

// Global: control de descargas pendientes por usuario
global.pendingDownloads = global.pendingDownloads || new Map();

module.exports = {
  command: ["ytdoc"],
  category: "descarga",
  description: "Descarga video de YouTube como documento",

  run: async (client, m, args) => {
    try {
      // ⚠️ Verifica si el usuario ya tiene un video pendiente
      if (global.pendingDownloads.get(m.sender)) {
        return client.reply(
          m.chat,
          "⚠️ Tienes un video pendiente enviándose. Espera a que termine antes de solicitar otro.",
          m,
          global.channelInfo
        );
      }

      const url = args[0];
      if (!url || !url.startsWith("http")) {
        return client.reply(
          m.chat,
          "❌ Usa el comando así:\n.ytdoc <link de YouTube>",
          m,
          global.channelInfo
        );
      }

      // Marca el usuario como "pendiente"
      global.pendingDownloads.set(m.sender, true);

      // Aviso de que se está procesando la descarga
      await client.sendMessage(
        m.chat,
        {
          text: `⏳ Tu video se está procesando...\nPuede tardar un momento si el archivo es pesado.\n🤖 Bot: ${BOT_NAME}`
        },
        m,
        global.channelInfo
      );

      // Llamada a API
      const res = await axios.get(`${GAW_API}?url=${encodeURIComponent(url)}`, { timeout: 60000 });
      const result = res.data?.result;

      if (!result?.mp4) {
        throw new Error("No se pudo obtener el video.");
      }

      const safeTitle = (result.title || "video").replace(/[\\/:*?"<>|]/g, "").trim();

      // Enviar video como documento
      await client.sendMessage(
        m.chat,
        {
          document: { url: result.mp4 },
          mimetype: "video/mp4",
          fileName: `${safeTitle}.mp4`,
          caption: `🎬 ${result.title}\n🤖 Bot: ${BOT_NAME}`
        },
        m,
        global.channelInfo
      );

    } catch (err) {
      console.error("YTDOC ERROR:", err.response?.data || err.message);
      await client.reply(
        m.chat,
        "❌ Error al descargar el video.",
        m,
        global.channelInfo
      );
    } finally {
      // Limpia el estado de descarga pendiente
      global.pendingDownloads.delete(m.sender);
    }
  }
};

