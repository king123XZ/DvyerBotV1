const axios = require('axios');

const API_KEY = 'M8EQKBf7LhgH';
const API_BASE = 'https://api-sky.ultraplus.click';

module.exports = {
  command: ["play","ytsearch","yt"],
  description: "Buscar videos de YouTube y enviar enlace",
  category: "downloader",
  run: async (client, m, args) => {
    if (!args[0]) return m.reply("⚠️ Ingresa el nombre de la canción o artista a buscar.");

    const query = args.join(" ");
    await m.reply(`⏳ Buscando: *${query}* ...`);

    try {
      // Llamada a la API de búsqueda
      const res = await axios.get(`${API_BASE}/api/utilidades/ytsearch.js`, {
        params: { q: query },
        headers: { Authorization: `Bearer ${API_KEY}` }
      });

      const results = res.data?.result;
      if (!results || results.length === 0) return

};


