const axios = require("axios");

const API = "https://gawrgura-api.onrender.com/download/tiktok";

module.exports = {
  command: ["tiktok", "tt"],
  categoria: "descarga",
  description: "Descarga TikTok automáticamente (video y audio)",

  run: async (client, m, args) => {
    try {
      const url = args[0];
      if (!url || !/tiktok\.com/.test(url)) {
        return client.reply(
          m.chat,
          "❌ Enlace inválido.\nEjemplo:\n.tiktok https://www.tiktok.com/@user/video/123",
          m,
          global.channelInfo
        );
      }

      // Aviso de descarga
      await client.reply(m.chat, "⏳ Descargando video y audio...", m, global.channelInfo);

      // Llamar API
      const res = await axios.get(`${API}?url=${encodeURIComponent(url)}`);
      const result = res.data?.result;

      if (!result || !result.video_nowm) {
        return client.reply(m.chat, "❌ Error al obtener video TikTok.", m, global.channelInfo);
      }

      // Descargar video como buffer
      const videoResp = await axios.get(result.video_nowm, { responseType: "arraybuffer" });
      const videoBuffer = Buffer.from(videoResp.data);

      // Descargar audio como buffer
      const audioResp = await axios.get(result.audio_url, { responseType: "arraybuffer" });
      const audioBuffer = Buffer.from(audioResp.data);

      // Enviar video
      await client.sendMessage(
        m.chat,
        { video: videoBuffer, mimetype: "video/mp4", fileName: "tiktok.mp4" },
        { quoted: m, ...global.channelInfo }
      );

      // Enviar audio
      await client.sendMessage(
        m.chat,
        { audio: audioBuffer, mimetype: "audio/mpeg", fileName: "tiktok.mp3", ptt: false },
        { quoted: m, ...global.channelInfo }
      );

    } catch (err) {
      console.error("TIKTOK DOWNLOAD ERROR:", err);
      client.reply(m.chat, "❌ Error al descargar TikTok.", m, global.channelInfo);
    }
  }
};
