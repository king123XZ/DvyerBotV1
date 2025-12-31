const axios = require("axios");
const yts = require("yt-search");

module.exports = {
  command: ["ytaudio"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      if (!args.length) {
        return m.reply("❌ Ingresa un enlace o nombre del video.");
      }

      await m.reply("⏳ Procesando audio...");

      let videoUrl = args.join(" ");
      let videoInfo;

      // 🔎 Buscar si no es link
      if (!videoUrl.startsWith("http")) {
        const search = await yts(videoUrl);
        if (!search.videos.length) {
          return m.reply("❌ No se encontraron resultados.");
        }
        videoInfo = search.videos[0];
        videoUrl = videoInfo.url;
      } else {
        const search = await yts({ videoId: videoUrl.split("v=")[1] });
        videoInfo = search?.videos?.[0];
      }

      const { data } = await axios.post(
        "https://api-sky.ultraplus.click/youtube-mp3",
        { url: videoUrl },
        {
          headers: {
            apikey: "sk_f606dcf6-f301-4d69-b54b-505c12ebec45"
          },
          timeout: 60000
        }
      );

      if (!data.status) {
        return m.reply("❌ Error al obtener el audio.");
      }

      const audioUrl = data.result?.media?.audio;
      const title = (data.result?.title || "audio")
        .replace(/[\\/:*?"<>|]/g, "")
        .slice(0, 60);

      const thumbnail =
        videoInfo?.thumbnail ||
        `https://i.ytimg.com/vi/${videoUrl.split("v=")[1]}/hqdefault.jpg`;

      if (!audioUrl) {
        return m.reply("❌ Audio no disponible.");
      }

      // 🖼️ MENSAJE 1: IMAGEN
      await client.sendMessage(
        m.chat,
        {
          image: { url: thumbnail },
          caption:
            `🎵 *${title}*\n\n` +
            "KILLUA-BOT V1.00"
        },
        { quoted: m }
      );

      // 🎧 MENSAJE 2: AUDIO + BOTÓN
      try {
        await client.sendMessage(
          m.chat,
          {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`,
            buttons: [
              {
                buttonId: "ver_canal",
                buttonText: { displayText: "📢 Ver canal" },
                type: 1,
                url: "https://whatsapp.com/channel/0029VaH4xpUBPzjendcoBI2c"
              }
            ],
            headerType: 1
          },
          { quoted: m }
        );
      } catch (e) {
        // 📄 Fallback documento
        await client.sendMessage(
          m.chat,
          {
            document: { url: audioUrl },
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`,
            buttons: [
              {
                buttonId: "ver_canal",
                buttonText: { displayText: "📢 Ver canal" },
                type: 1,
                url: "https://whatsapp.com/channel/0029VaH4xpUBPzjendcoBI2c"
              }
            ],
            headerType: 1
          },
          { quoted: m }
        );
      }

    } catch (err) {
      console.error("YTAUDIO ERROR:", err.message);
      m.reply("❌ Ocurrió un error al procesar el audio.");
    }
  }
};