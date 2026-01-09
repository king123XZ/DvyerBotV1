const axios = require("axios");
const yts = require("yt-search");

// ADONIX API
const ADONIX_API = "https://api-adonix.ultraplus.click/download/ytaudio";
const ADONIX_KEY = "dvyer";

// BOT
const BOT_NAME = "KILLUA-BOT v1.00";

module.exports = {
  command: ["ytaudio"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
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

      // ⚡ Mensaje inmediato
      await client.reply(
        m.chat,
        `⏳ *Descargando audio...*\n` +
        `✅ API: ADONIX\n` +
        `🤖 ${BOT_NAME}`,
        m,
        global.channelInfo
      );

      // 📡 Llamada a ADONIX
      const res = await axios.get(
        `${ADONIX_API}?url=${encodeURIComponent(videoUrl)}&apikey=${ADONIX_KEY}`,
        { timeout: 60000 }
      );

      if (!res.data || !res.data.data || !res.data.data.url) {
        throw new Error("Respuesta inválida de ADONIX");
      }

      let audioUrl = res.data.data.url;
      let title = res.data.data.title || "audio";

      // 🧼 Limpiar título
      title = title.replace(/[\\/:*?"<>|]/g, "").trim().slice(0, 60);

      // 🎧 Enviar audio usando channelInfo
      await client.sendMessage(
        m.chat,
        {
          audio: { url: audioUrl },
          mimetype: "audio/mpeg",
          fileName: `${title}.mp3`
        },
        {
          quoted: m,
          ...global.channelInfo
        }
      );

    } catch (err) {
      console.error("YTAUDIO ADONIX ERROR:", err.response?.data || err.message);
      await client.reply(
        m.chat,
        "❌ Error al descargar el audio.",
        m,
        global.channelInfo
      );
    }
  }
};

