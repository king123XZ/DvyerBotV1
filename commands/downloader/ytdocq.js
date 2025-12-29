const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
const API_URL = "https://api-sky.ultraplus.click/youtube-mp4/resolve";

// orden de fallback
const FALLBACK = ["720", "480", "360"];

module.exports = {
  command: ["ytdocq"],
  category: "downloader",

  run: async (client, m, args) => {
    try {
      const quality = args[0];
      const owner = args[1];

      // 🔐 solo el que pidió puede usar
      if (owner !== m.sender) return;

      const cache = global.ytDocCache?.[m.sender];
      if (!cache) return m.reply("❌ El enlace expiró. Usa *ytdoc* otra vez.");

      if (!quality) return;

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
          timeout: 45000 // ⏱️ timeout alto
        }
      );

      const data = res.data?.result;
      const link = data?.media?.direct;

      if (!link) throw new Error("NO_LINK");

      await client.sendMessage(
        m.chat,
        {
          document: { url: link },
          mimetype: "video/mp4",
          fileName: `${data.title} - ${quality}p.mp4`,
          caption: `📄 ${data.title}\n📺 Calidad: ${quality}p`
        },
        { quoted: m }
      );

      delete global.ytDocCache[m.sender];

    } catch (err) {
      console.error("YTDOCQ ERROR:", err.message);

      // 🔁 fallback automático
      const next = FALLBACK[FALLBACK.indexOf(args[0]) + 1];
      if (next) {
        return m.reply(`⚠️ ${args[0]}p falló, probando ${next}p...`)
          .then(() => client.emit("message", {
            key: m.key,
            message: { conversation: `.ytdocq ${next} ${m.sender}` },
            sender: m.sender
          }));
      }

      m.reply("❌ No se pudo enviar el documento.");
      delete global.ytDocCache[m.sender];
    }
  }
};
