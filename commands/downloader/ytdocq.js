const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
const API_URL = "https://api-sky.ultraplus.click/youtube-mp4/resolve";
const VALID_QUALITIES = ["144", "240", "360", "480"];

if (!global.ytDocCache) global.ytDocCache = {};
if (!global.ytCooldown) global.ytCooldown = {};

module.exports = {
  command: ["ytdocq"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      const quality = args[0];

      if (!quality)
        return m.reply("❌ Usa: *ytdocq 360*");

      if (!VALID_QUALITIES.includes(quality))
        return m.reply("❌ Calidad permitida: 144 / 240 / 360 / 480");

      // ⏳ Cooldown anti-spam (10s)
      const now = Date.now();
      if (global.ytCooldown[m.sender] && now - global.ytCooldown[m.sender] < 10000) {
        return m.reply("⏳ Espera unos segundos antes de volver a usar el comando.");
      }
      global.ytCooldown[m.sender] = now;

      const cache = global.ytDocCache[m.sender];
      if (!cache || !cache.url) {
        return m.reply("❌ El enlace expiró. Usa *ytdoc* otra vez.");
      }

      await m.reply(`⬇️ Descargando documento *${quality}p*...`);

      const res = await axios.post(
        API_URL,
        {
          url: cache.url,
          type: "video",
          quality
        },
        {
          headers: { apikey: API_KEY },
          timeout: 60000
        }
      );

      const data = res.data?.result;
      const link = data?.media?.direct;
      if (!link) {
        console.log("RESPUESTA API:", res.data);
        throw "LINK_INVALIDO";
      }

      // 🧼 Sanitizar nombre
      const safeTitle = data.title.replace(/[\\/:*?"<>|]/g, "");
      const fileName = `${safeTitle} - ${quality}p.mp4`;

      await client.sendMessage(
        m.chat,
        {
          document: { url: link },
          mimetype: "video/mp4",
          fileName,
          caption: `📄 *${data.title}*\n📺 Calidad: ${quality}p`
        },
        { quoted: m }
      );

      delete global.ytDocCache[m.sender];

    } catch (err) {
      console.error("❌ YTDOCQ ERROR:", err.response?.data || err);
      m.reply("❌ Error al descargar. Prueba otra calidad.");
      delete global.ytDocCache[m.sender];
    }
  }
};