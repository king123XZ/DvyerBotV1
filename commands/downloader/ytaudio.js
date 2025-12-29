const axios = require("axios");
const yts = require("yt-search");

module.exports = {
  command: ["ytaudio"],
  description: "Descarga audio MP3 de YouTube",
  category: "downloader",
  use: "ytaudio <link o nombre>",

  run: async (client, m, args) => {
    try {
      if (!args.length) {
        return m.reply("❌ Ingresa un link o nombre de YouTube.");
      }

      await m.reply("⏳ Procesando audio...");

      let videoUrl = args.join(" ");

      // 🔍 Buscar si no es link
      if (!videoUrl.startsWith("http")) {
        const search = await yts(videoUrl);
        if (!search.videos.length) {
          return m.reply("❌ No se encontraron resultados.");
        }
        videoUrl = search.videos[0].url;
      }

      // 🔑 TU API KEY
      const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";

      // 📡 PETICIÓN POST CORRECTA
      const { data } = await axios.post(
        "https://api-sky.ultraplus.click/youtube-mp3",
        { url: videoUrl },
        { headers: { "Content-Type": "application/json", apikey: API_KEY } }
      );

      if (!data.status) {
        return m.reply("❌ La API no pudo procesar el audio.");
      }

      const result = data.result;
      const audioUrl = result?.media?.audio;

      if (!audioUrl) {
        return m.reply("❌ No se pudo obtener el audio.");
      }

      const caption = `🎵 *YouTube MP3*
📌 Título: ${result.title}
👤 Autor: ${result.author?.name || "YouTube"}
⏱ Duración: ${result.duration || "?"}s`;

      // 🔹 Enviar audio con botón de canal
      await client.sendMessage(
        m.chat,
        {
          audio: { url: audioUrl },
          mimetype: "audio/mpeg",
          fileName: `${result.title}.mp3`,
          caption,
          contextInfo: {
            externalAdReply: {
              showAdAttribution: true,
              mediaType: 2,
              title: "📢 Ver Canal",
              body: "Únete al canal oficial del bot",
              thumbnailUrl: "https://i.ibb.co/hFDcdpBg/menu.png",
              sourceUrl: "https://whatsapp.com/channel/0029VaH4xpUBPzjendcoBI2c" // enlace directo a tu canal
            }
          }
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("YTAUDIO ERROR:", err.response?.data || err.message);

      if (err.response?.status === 401)
        return m.reply("❌ API Key inválida.");
      if (err.response?.status === 429)
        return m.reply("❌ Límite de la API alcanzado.");
      if (err.response?.status === 500)
        return m.reply("❌ Error interno de la API.");

      m.reply("❌ Error al descargar el audio.");
    }
  }
};
