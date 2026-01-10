const axios = require("axios");
const yts = require("yt-search");

// BOT
const BOT_NAME = "KILLUA-BOT v1.00";

// Usuarios con descargas pendientes
global.pendingDownloads = global.pendingDownloads || new Map();

module.exports = {
  command: ["ytaudio"],
  category: "descarga",
  description: "Descarga el audio de un video de YouTube en formato MP3",

  run: async (client, m, args) => {
    try {
      // Evitar múltiples descargas simultáneas
      if (global.pendingDownloads.get(m.sender)) {
        return m.reply(
          "⚠️ Tienes un archivo pendiente enviándose. Por favor espera a que termine antes de solicitar otro.",
          m
        );
      }

      if (!args.length) {
        return m.reply("❌ Ingresa un enlace o nombre del video.", m);
      }

      let videoUrl = args.join(" ");

      // 🔎 Buscar si no es link
      if (!videoUrl.startsWith("http")) {
        const search = await yts(videoUrl);
        if (!search.videos || !search.videos.length) {
          return m.reply("❌ No se encontraron resultados.", m);
        }
        videoUrl = search.videos[0].url;
      }

      // Marcar descarga como pendiente
      global.pendingDownloads.set(m.sender, true);

      // ⚡ Mensaje de aviso mejorado
      await client.sendMessage(
        m.chat,
        { 
          text: `⏳ Tu audio se está procesando...\nPuede tardar un momento si el archivo es pesado.\n🤖 Bot: ${BOT_NAME}` 
        },
        { quoted: m }
      );

      // 📡 Llamada a ADONIX
      const res = await axios.get(
        `https://api-adonix.ultraplus.click/download/ytaudio?url=${encodeURIComponent(videoUrl)}&apikey=dvyer`,
        { timeout: 60000 }
      );

      if (!res.data?.data?.url) {
        throw new Error("No se pudo obtener el audio.");
      }

      let audioUrl = res.data.data.url;
      let title = (res.data.data.title || "audio")
        .replace(/[\\/:*?"<>|]/g, "")
        .trim()
        .slice(0, 60);

      // 🎧 Enviar audio
      await client.sendMessage(
        m.chat,
        {
          audio: { url: audioUrl },
          mimetype: "audio/mpeg",
          fileName: `${title}.mp3`,
          caption: `🎧 ${title}\n🤖 Bot: ${BOT_NAME}`
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("YTAUDIO ERROR:", err.response?.data || err.message);
      m.reply("❌ Error al descargar el audio.", m);
    } finally {
      // Quitar el bloqueo aunque falle
      global.pendingDownloads.delete(m.sender);
    }
  }
};


