const axios = require("axios");
const fetch = require("node-fetch");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
const API_URL = "https://api-sky.ultraplus.click/tiktok";

module.exports = {
  command: ["tiktok", "tt"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      if (!args[0]) {
        return m.reply(
          "📌 Ingresa un enlace de TikTok\n\nEjemplo:\n!tiktok https://www.tiktok.com/@user/video/123"
        );
      }

      let url = args[0];

      // 🔁 Resolver enlaces cortos (vm / vt)
      if (url.includes("vm.tiktok.com") || url.includes("vt.tiktok.com")) {
        const res = await fetch(url, { redirect: "follow" });
        url = res.url;
      }

      await m.reply("⏳ Descargando video...");

      const { data } = await axios.post(
        API_URL,
        { url },
        {
          headers: {
            "Content-Type": "application/json",
            apikey: API_KEY
          }
        }
      );

      if (!data.status || !data.result?.video) {
        console.log("RESPUESTA API:", data);
        return m.reply("❌ No se pudo obtener el video.");
      }

      const video = data.result.video;
      const caption = `🎬 *TikTok Video*
👤 Autor: ${data.result.author?.name || "Desconocido"}
📝 Título: ${data.result.title || "Sin título"}`;

      await client.sendMessage(
        m.chat,
        {
          video: { url: video },
          mimetype: "video/mp4",
          caption
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("TIKTOK ERROR:", err.response?.data || err);
      m.reply("❌ Error al descargar el video.");
    }
  }
};



