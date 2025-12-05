const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  command: ["play"],
  description: "Descarga audio usando Neoxr API",
  run: async (client, m, args) => {
    const chatId = m.key.remoteJid;
    const query = args.join(" ");
    const pref = global.prefixes?.[0] || ".";

    if (!query) return client.sendMessage(chatId, { text: `⚠️ Uso:\n${pref}play <canción>` }, { quoted: m });

    await client.sendMessage(chatId, { react: { text: "⏳", key: m.key } });

    try {
      // Llamada a Neoxr API
      const res = await axios.get("https://api.neoxr.eu/api/play", {
        params: { q: query, apikey: "zMqDtV" },
        timeout: 60000
      });

      const data = res.data?.data;
      if (!res.data?.status || !data || !data.url) throw new Error("No se encontró la canción.");

      const { title, artist, url: audioUrl, thumbnail, duration } = data;

      // Descarga el audio a un buffer temporal
      const audioRes = await axios.get(audioUrl, { responseType: 'arraybuffer', timeout: 120000 });
      const audioBuffer = Buffer.from(audioRes.data, 'binary');

      // Carpeta temporal
      const tmpDir = path.join(__dirname, '../tmp');
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
      const filePath = path.join(tmpDir, `${Date.now()}_${title}.mp3`);
      fs.writeFileSync(filePath, audioBuffer);

      // Enviar audio
      await client.sendMessage(chatId, {
        audio: fs.readFileSync(filePath),
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
        caption: `🎵 ${title} - ${artist}\nDuración: ${duration || "Desconocida"}`
      }, { quoted: m });

      fs.unlinkSync(filePath); // Limpieza

      await client.sendMessage(chatId, { react: { text: "✅", key: m.key } });

    } catch (err) {
      console.error("❌ Error al usar Neoxr API:", err);
      await client.sendMessage(chatId, { text: `❌ Error: ${err.message}` }, { quoted: m });
      await client.sendMessage(chatId, { react: { text: "❌", key: m.key } });
    }
  }
};

