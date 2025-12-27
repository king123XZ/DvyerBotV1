const axios = require("axios");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
const API_BASE = "https://api-sky.ultraplus.click";

module.exports = {
  command: ["play"],
  description: "Buscar música en YouTube y mostrar opciones",
  category: "downloader",

  run: async (client, m, args) => {
    try {
      // ===============================
      // 🔒 PERMISOS
      // ===============================
      const owners = [
        "51917391317@s.whatsapp.net",
        "51907376960@s.whatsapp.net"
      ];

      const isOwner = owners.includes(m.sender);

      const groupMetadata = m.isGroup
        ? await client.groupMetadata(m.chat)
        : {};
      const admins = m.isGroup
        ? groupMetadata.participants.filter(p => p.admin)
        : [];
      const isAdmin = admins.some(p => p.id === m.sender);

      if (!isOwner && !isAdmin) {
        return client.sendMessage(
          m.chat,
          { text: "🚫 *Comando solo para OWNERS o ADMINS.*" },
          { quoted: m }
        );
      }

      // ===============================
      // 📌 VALIDACIONES
      // ===============================
      if (!args.length) {
        return client.sendMessage(
          m.chat,
          { text: "⚠️ Ingresa el nombre de la canción o artista." },
          { quoted: m }
        );
      }

      const query = args.join(" ");
      await client.sendMessage(
        m.chat,
        { text: `⏳ Buscando: *${query}* ...` },
        { quoted: m }
      );

      // ===============================
      // 🔍 BÚSQUEDA
      // ===============================
      const res = await axios.get(
        `${API_BASE}/api/utilidades/ytsearch.js`,
        {
          params: { q: query },
          headers: {
            apikey: API_KEY
          }
        }
      );

      const results = res.data?.Result;
      if (!results || !results.length) {
        return client.sendMessage(
          m.chat,
          { text: "❌ No se encontraron resultados." },
          { quoted: m }
        );
      }

      const video = results[0];

      const caption = `🎬 *Título:* ${video.titulo}
📌 *Canal:* ${video.canal}
⏱ *Duración:* ${video.duracion}
👁 *Vistas:* ${Number(video.vistas).toLocaleString()}
🔗 *Enlace:* ${video.url}`;

      const buttons = [
        { buttonId: `.ytaudio ${video.url}`, buttonText: { displayText: "🎵 Audio" }, type: 1 },
        { buttonId: `.ytvideo ${video.url}`, buttonText: { displayText: "🎬 Video" }, type: 1 },
        { buttonId: `.ytdoc ${video.url}`, buttonText: { displayText: "📄 Documento" }, type: 1 }
      ];

      await client.sendMessage(
        m.chat,
        {
          image: { url: video.miniatura },
          caption,
          footer: "DevYER",
          buttons,
          headerType: 4
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("PLAY ERROR:", err.response?.data || err.message);
      client.sendMessage(
        m.chat,
        { text: "❌ Error al buscar la canción." },
        { quoted: m }
      );
    }
  }
};
