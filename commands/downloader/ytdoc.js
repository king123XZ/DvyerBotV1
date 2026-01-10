const axios = require("axios");

// 🤖 Bot
const BOT_NAME = "KILLUA-BOT v1.00";

// Variable global para usuarios con descargas pendientes
global.pendingDownloads = global.pendingDownloads || new Map();

module.exports = {
  command: ["ytdoc"],          // Nombre del comando
  category: "descarga",         // Categoría
  description: "Descarga video de YouTube como documento", // Descripción

  run: async (client, m, args) => {
    try {
      // Evitar múltiples descargas al mismo tiempo
      if (global.pendingDownloads.get(m.sender)) {
        return m.reply(
          "⚠️ Tienes un archivo pendiente enviándose. Espera a que termine antes de pedir otro.",
          m
        );
      }

      const url = args[0];
      if (!url || !url.startsWith("http")) {
        return m.reply("❌ Usa:\n.ytdoc <link de YouTube>", m);
      }

      // Marcar descarga como pendiente
      global.pendingDownloads.set(m.sender, true);

      // Mensaje informativo
      await client.sendMessage(
        m.chat,
        { text: `⏳ Se está procesando tu video...\nPuede tardar si el archivo es grande.\n🤖 ${BOT_NAME}` },
        { quoted: m }
      );

      // Llamada a API de ejemplo (puedes cambiar por la de Gawrgura o tu preferida)
      const GAW_API = "https://gawrgura-api.onrender.com/download/ytdl";
      const res = await axios.get(`${GAW_API}?url=${encodeURIComponent(url)}`, { timeout: 60000 });
      const result = res.data?.result;

      if (!result || !result.mp4) {
        throw new Error("No se obtuvo video");
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
        { quoted: m }
      );

    } catch (err) {
      console.error("YTDOC ERROR:", err.response?.data || err.message);
      m.reply("❌ Error al descargar el video.", m);
    } finally {
      // Quitar el bloqueo aunque falle
      global.pendingDownloads.delete(m.sender);
    }
  }
};
