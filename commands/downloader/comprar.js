const axios = require("axios");
const movies = require("../../lib/movies");

const API_KEY = "sk_f606dcf6-f301-4d69-b54b-505c12ebec45";
const MAX_MB = 1800;

module.exports = {
  command: ["comprar"],
  category: "media",

  run: async (client, m, args) => {
    args = args || [];

    // 👑 SOLO DUEÑO
    const sender = m.sender.split("@")[0];
    if (!global.owner.includes(sender)) {
      return m.reply(
        "⛔ *Acceso denegado*\n\n" +
        "Esta acción está disponible solo para el administrador.\n" +
        "📩 Contacta para comprar créditos."
      );
    }

    // 🎬 ID
    const id = parseInt(args[0]);
    if (!id) return m.reply("❌ Error: ID de película no válido.");

    const movie = movies.find(p => p.id === id);
    if (!movie) return m.reply("❌ Película no encontrada.");

    // 🔔 MENSAJE LIMPIO
    await m.reply(
      "🎬 *Película seleccionada*\n\n" +
      "⏳ Preparando archivo...\n" +
      "📦 Enviando película, espera un momento."
    );

    try {
      // 🔒 LINK OCULTO
      const res = await axios.post(
        "https://api-sky.ultraplus.click/download/mediafire",
        { url: movie.url },
        { headers: { apikey: API_KEY }, timeout: 20000 }
      );

      const file = res.data?.result?.files?.[0];
      if (!file) return m.reply("❌ No se pudo preparar la película.");

      // 📏 TAMAÑO
      const sizeMatch = file.size.match(/([\d.]+)\s*MB/i);
      const sizeMB = sizeMatch ? parseFloat(sizeMatch[1]) : 0;

      if (sizeMB > MAX_MB) {
        return m.reply(`❌ Archivo demasiado grande\n📦 ${file.size}`);
      }

      // ⬇️ DESCARGA
      const stream = await axios.get(file.download, {
        responseType: "arraybuffer",
        timeout: 0
      });

      // 📤 ENVÍO
      await client.sendMessage(
        m.chat,
        {
          document: Buffer.from(stream.data),
          fileName: file.name,
          mimetype: "application/octet-stream",
          caption:
            "🎥 *Película enviada con éxito*\n" +
            "🍿 Disfrútala\n\n" +
            "👑 Killua Bot • DevYer"
        },
        { quoted: m }
      );

      console.log(`🎬 PELÍCULA ENVIADA: ${movie.title}`);

    } catch (err) {
      console.error("ERROR PELICULA:", err);
      m.reply("❌ Error al enviar la película.");
    }
  }
};
