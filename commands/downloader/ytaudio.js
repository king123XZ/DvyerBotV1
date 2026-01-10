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
      // ⚠️ Validar descargas pendientes
      if (global.pendingDownloads.get(m.sender)) {
        return client.reply(
          m.chat,
          "⚠️ Tienes un archivo pendiente enviándose. Espera a que termine antes de solicitar otro.",
          m,
          global.channelInfo
        );
      }

      if (!args.length) {
        return client.reply(
          m.chat,
          "❌ Ingresa un enlace o nombre del video.",
          m,
          global.channelInfo
        );
      }

      let videoUrl = args.join(" ");

      // 🔎 Buscar si no es link
      if (!videoUrl.startsWith("http")) {
        const search = await yts(videoUrl);
        if (!search.videos || !search.videos.length) {
          return client.reply(
            m.chat,
            "❌ No se encontraron resultados.",
            m,
            global.channelInfo
          );
        }
        videoUrl = search.videos[0].url;
      }

      // Marcar descarga como pendiente
      global.pendingDownloads.set(m.sender, true);

      // ⚡ Mensaje de aviso
      await client.sendMessage(
        m.chat,
        { 
          text: `⏳ Tu audio se está procesando...\nPuede tardar un momento si el archivo es pesado.\n🤖 Bot: ${BOT_NAME}` 
        },
        m,
        global.channelInfo
      );

      // 📡 Llamada a la API
      const res = await axios.get(
        `https://api-adonix.ultraplus.click/download/ytaudio?url=${encodeURIComponent(videoUrl)}&apikey=dvyer`,
        { timeout: 60000 }
      );

      if (!res.data?.data?.url) {
        throw new Error("No se pudo obtener el audio.");
      }

      const audioUrl = res.data.data.url;
      const title = (res.data.data.title || "audio")
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
        m,
        global.channelInfo
      );

    } catch (err) {
      console.error("YTAUDIO ERROR:", err.response?.data || err.message);
      await client.reply(
        m.chat,
        "❌ Error al descargar el audio.",
        m,
        global.channelInfo
      );
    } finally {
      // Quitar bloqueo
      global.pendingDownloads.delete(m.sender);
    }
  }
};

