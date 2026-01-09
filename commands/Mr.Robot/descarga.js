const series = require("../../lib/series");
const axios = require("axios");

const API_KEY = "dvyer"; // Tu API Key de MediaFire
const MAX_MB = 1800; // Límite en MB

module.exports = {
  command: ["mr_robot", "descargar_cap"],
  category: "media",
  description: "Descarga capítulos de Mr. Robot temporada 1",

  run: async (client, m, args) => {
    if (!args[0]) return m.reply("❌ Debes indicar el capítulo. Ejemplo: .mr_robot t1-1");

    const [seasonPart, epPart] = args[0].replace("t", "").split("-");
    const epNum = parseInt(epPart);

    const s = series.find(x => x.id === "mr_robot");
    if (!s) return m.reply("❌ Serie no encontrada.");

    const season = s.seasons.find(t => t.season === parseInt(seasonPart));
    if (!season) return m.reply("❌ Temporada no encontrada.");

    const ep = season.episodes.find(e => e.ep === epNum);
    if (!ep) return m.reply("❌ Capítulo no encontrado.");

    if (!ep.url || ep.url === "") {
      return m.reply(`⚠️ Capítulo ${ep.title} aún no disponible.`);
    }

    try {
      await m.reply(`⏳ Obteniendo información del capítulo...`);

      // 1️⃣ Obtener info del archivo usando la API
      const res = await axios.get(
        "https://api-adonix.ultraplus.click/download/mediafire",
        { params: { apikey: API_KEY, url: ep.url }, timeout: 0 }
      );

      const files = res.data?.result || [];
      if (!files.length) return m.reply("❌ No se pudo obtener el archivo de MediaFire.");

      const file = files[0];

      // 2️⃣ Calcular tamaño en MB
      let sizeMB = 0;
      if (file.size.toUpperCase().includes("KB")) sizeMB = parseFloat(file.size) / 1024;
      else if (file.size.toUpperCase().includes("MB")) sizeMB = parseFloat(file.size);
      else if (file.size.toUpperCase().includes("GB")) sizeMB = parseFloat(file.size) * 1024;

      if (sizeMB > MAX_MB)
        return m.reply(`❌ Archivo demasiado grande (${sizeMB.toFixed(2)} MB). Límite: ${MAX_MB} MB`);

      await m.reply(`📥 Descargando capítulo completo...\n📄 ${decodeURIComponent(file.nama)}\n📏 ${file.size}`);

      // 3️⃣ Descargar archivo completo en memoria
      const download = await axios.get(file.link, { responseType: "arraybuffer", timeout: 0 });
      const buffer = Buffer.from(download.data);

      // 4️⃣ Enviar al chat
      await client.sendMessage(
        m.chat,
        {
          document: buffer,
          mimetype: `application/${file.mime}`,
          fileName: decodeURIComponent(file.nama),
          caption: `📦 ${ep.title} - Audio Latino`
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("MEDIAFIRE ERROR:", err.response?.data || err.message);
      return m.reply("❌ Error al descargar el capítulo de MediaFire.");
    }
  }
};

