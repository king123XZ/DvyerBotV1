const axios = require("axios");

const API = "https://gawrgura-api.onrender.com/download/tiktok";

// Cache temporal para el botón
const ttCache = {};

module.exports = {
  command: ["tiktok", "tt"],
  category: "downloader",
  description: "Descarga TikTok (video/audio/ambos) con botones",

  run: async (client, m, args) => {
    try {

      // --- RESPONDER BOTONES ---
      if (m?.message?.buttonsResponseMessage) {
        const id = m.message.buttonsResponseMessage.selectedButtonId;
        const url = ttCache[m.sender];

        if (!url) {
          return client.reply(m.chat, "❌ Sesión expirada, envía el enlace otra vez.", m);
        }

        const res = await axios.get(`${API}?url=${encodeURIComponent(url)}`);
        const result = res.data?.result;

        if (!result) throw new Error("Respuesta inválida");

        // Video
        if (id === "tt_video") {
          await client.sendMessage(
            m.chat,
            { video: { url: result.video_nowm }, mimetype: "video/mp4", fileName: "tiktok.mp4" },
            { quoted: m }
          );
        }

        // Audio
        if (id === "tt_audio") {
          await client.sendMessage(
            m.chat,
            { audio: { url: result.audio_url }, mimetype: "audio/mpeg", ptt: false },
            { quoted: m }
          );
        }

        // Ambos
        if (id === "tt_both") {
          await client.sendMessage(
            m.chat,
            { video: { url: result.video_nowm }, mimetype: "video/mp4", fileName: "tiktok.mp4" },
            { quoted: m }
          );
          await client.sendMessage(
            m.chat,
            { audio: { url: result.audio_url }, mimetype: "audio/mpeg", ptt: false },
            { quoted: m }
          );
        }

        delete ttCache[m.sender];
        return;
      }

      // --- COMANDO NORMAL ---
      const url = args[0];
      if (!url || !/tiktok\.com/.test(url)) {
        return client.reply(
          m.chat,
          "❌ Enlace inválido.\nEjemplo:\n.tiktok https://www.tiktok.com/@user/video/123",
          m
        );
      }

      // Guardar temporal para el botón
      ttCache[m.sender] = url;

      // Botones funcionales
      const buttons = [
        { buttonId: "tt_video", buttonText: { displayText: "🎥 Video" }, type: 1 },
        { buttonId: "tt_audio", buttonText: { displayText: "🎧 Audio" }, type: 1 },
        { buttonId: "tt_both", buttonText: { displayText: "🎥 + 🎧 Ambos" }, type: 1 }
      ];

      const buttonMessage = {
        text: "📥 Selecciona qué deseas descargar:",
        buttons: buttons,
        headerType: 1
      };

      await client.sendMessage(m.chat, buttonMessage, { quoted: m });

    } catch (err) {
      console.error("TIKTOK ERROR:", err);
      client.reply(m.chat, "❌ Error al descargar TikTok.", m);
    }
  }
};


