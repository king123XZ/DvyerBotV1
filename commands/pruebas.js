const axios = require("axios");

module.exports = {
  name: "youtube",
  alias: ["descargar", "enlace"],
  category: "media",
  isOwner: false, // poner true si solo el dueño puede usar
  run: async (client, m, { args, command }) => {
    if (!args || !args[0]) return m.reply("❌ Por favor, envía un enlace de YouTube.");
    
    const url = args[0];
    const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45"; // tu API key

    try {
      // llama al endpoint de YouTube
      const res = await axios.post(
        "https://api-sky.ultraplus.click/aio1",
        { url },
        { headers: { apikey: API_KEY } }
      );

      if (!res.data.status) return m.reply("❌ Error al obtener el video.");

      const video = res.data.result;

      if (command.toLowerCase() === "descargar") {
        // envía el video a WhatsApp
        await client.sendMessage(
          m.from,
          { video: { url: video.media }, caption: `🎬 ${video.title}` },
          { quoted: m }
        );
      } else if (command.toLowerCase() === "enlace") {
        // envía solo el link directo
        await client.sendMessage(
          m.from,
          { text: `🎬 ${video.title}\n🔗 Enlace directo: ${video.media}` },
          { quoted: m }
        );
      }
    } catch (err) {
      console.log(err);
      m.reply("❌ Ocurrió un error al procesar tu solicitud.");
    }
  },
};
