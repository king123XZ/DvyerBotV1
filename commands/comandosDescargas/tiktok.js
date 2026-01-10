const axios = require("axios");

const API = "https://gawrgura-api.onrender.com/download/tiktok";

// cache simple en memoria
const ttCache = {};

module.exports = {
  command: ["tiktok", "tt"],
  category: "downloader",

  run: async (client, m, args) => {
    try {

      /* ===============================
         BOTONES (RESPUESTA)
      =============================== */
      if (m.buttonReply) {
        const id = m.buttonReply.selectedButtonId;
        if (!id.startsWith("tt_")) return;

        const url = ttCache[m.sender];
        if (!url) {
          return client.reply(
            m.chat,
            "❌ La sesión expiró, usa `.tiktok <url>` otra vez.",
            m
          );
        }

        const res = await axios.get(
          `${API}?url=${encodeURIComponent(url)}`,
          { timeout: 120000 }
        );

        const result = res.data?.result;
        if (!result) throw new Error("Respuesta inválida");

        // 🎥 VIDEO
        if (id === "tt_video") {
          await client.sendMessage(
            m.chat,
            {
              video: { url: result.video_nowm },
              mimetype: "video/mp4",
              fileName: "tiktok.mp4"
            },
            { quoted: m }
          );
        }

        // 🎧 AUDIO
        if (id === "tt_audio") {
          await client.sendMessage(
            m.chat,
            {
              audio: { url: result.audio_url },
              mimetype: "audio/mpeg",
              ptt: false
            },
            { quoted: m }
          );
        }

        // 🎥 + 🎧 AMBOS
        if (id === "tt_both") {
          await client.sendMessage(
            m.chat,
            {
              video: { url: result.video_nowm },
              mimetype: "video/mp4",
              fileName: "tiktok.mp4"
            },
            { quoted: m }
          );

          await client.sendMessage(
            m.chat,
            {
              audio: { url: result.audio_url },
              mimetype: "audio/mpeg",
              ptt: false
            },
            { quoted: m }
          );
        }

        delete ttCache[m.sender];
        return;
      }

      /* ===============================
         COMANDO NORMAL
      =============================== */
      const url = args[0];
      if (!url || !/tiktok\.com/.test(url)) {
        return client.reply(
          m.chat,
          "❌ Enlace inválido.\nEjemplo:\n.tiktok https://www.tiktok.com/@user/video/123",
          m,
          global.channelInfo
        );
      }

      // guardar link
      ttCache[m.sender] = url;

      const buttons = [
        {
          buttonId: "tt_video",
          buttonText: { displayText: "🎥 Video" },
          type: 1
        },
        {
          buttonId: "tt_audio",
          buttonText: { displayText: "🎧 Audio" },
          type: 1
        },
        {
          buttonId: "tt_both",
          buttonText: { displayText: "🎥 + 🎧 Ambos" },
          type: 1
        }
      ];

      await client.sendMessage(
        m.chat,
        {
          text: "📥 *Selecciona qué deseas descargar:*",
          buttons,
          headerType: 1
        },
        { quoted: m, ...global.channelInfo }
      );

    } catch (err) {
      console.error("TIKTOK ERROR:", err);
      client.reply(m.chat, "❌ Error al descargar TikTok.", m);
    }
  }
};


