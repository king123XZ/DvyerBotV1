const axios = require("axios");

const API_KEY = "dvyer";

// 🔴 TU LINK DE MEDIAFIRE AQUÍ
const VLC_MEDIAFIRE =
  "https://www.mediafire.com/file/n6hqydz5sk31l3u/vlc-3-7-0-beta-1.apk/file";

module.exports = {
  command: ["descargar_vlc"],
  category: "general",

  run: async (client, m) => {
    await client.reply(
      m.chat,
      "⏳ Descargando *VLC Media Player*...\nEspera un momento.",
      m
    );

    try {
      const res = await axios.get(
        "https://api-adonix.ultraplus.click/download/mediafire",
        {
          params: { apikey: API_KEY, url: VLC_MEDIAFIRE },
          timeout: 0
        }
      );

      const file = res.data.result[0];
      const data = await axios.get(file.link, {
        responseType: "arraybuffer",
        timeout: 0
      });

      await client.sendMessage(
        m.chat,
        {
          document: Buffer.from(data.data),
          mimetype: "application/vnd.android.package-archive",
          fileName: "VLC_Media_Player.apk",
          caption: "📥 VLC Media Player para Android"
        },
        { quoted: m }
      );
    } catch (e) {
      await client.reply(m.chat, "❌ Error al descargar VLC.", m);
    }
  }
};
