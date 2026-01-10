const axios = require("axios");

// ADONIX API
const ADONIX_API = "https://api-adonix.ultraplus.click/download/instagram";
const ADONIX_KEY = "dvyer";

// BOT
const BOT_NAME = "KILLUA-BOT v1.00";

module.exports = {
  command: ["instagram", "ig", "igdl"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      const url = args[0];

      if (!url || !url.startsWith("http")) {
        return client.reply(
          m.chat,
          "❌ Enlace de Instagram no válido.",
          m,
          global.channelInfo
        );
      }

      // ⏳ UX
      await client.reply(
        m.chat,
        `⏳ *Descargando Instagram...*\n` +
        `✅ API: ADONIX\n` +
        `🤖 ${BOT_NAME}`,
        m,
        global.channelInfo
      );

      // 📡 Llamada API
      const res = await axios.get(
        `${ADONIX_API}?url=${encodeURIComponent(url)}&apikey=${ADONIX_KEY}`,
        { timeout: 120000 }
      );

      const data = res.data?.data;
      if (!data || !data.url) {
        throw new Error("Respuesta inválida de Adonix");
      }

      const mediaUrl = data.url;
      const type = data.type || "video"; // video | image

      // 📤 Enviar según tipo
      if (type === "image") {
        await client.sendMessage(
          m.chat,
          { image: { url: mediaUrl } },
          { quoted: m, ...global.channelInfo }
        );
      } else {
        await client.sendMessage(
          m.chat,
          {
            video: { url: mediaUrl },
            mimetype: "video/mp4"
          },
          { quoted: m, ...global.channelInfo }
        );
      }

    } catch (err) {
      console.error("INSTAGRAM ADONIX ERROR:", err.response?.data || err.message);
      await client.reply(
        m.chat,
        "❌ Error al descargar contenido de Instagram.",
        m,
        global.channelInfo
      );
    }
  }
};
