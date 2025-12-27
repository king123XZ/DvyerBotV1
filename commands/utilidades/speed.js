const axios = require("axios");

module.exports = {
  command: ["speed", "internet", "velocidad"],
  description: "Mide la velocidad de internet del servidor",
  category: "stickers",

  run: async (client, m) => {
    try {
      await m.reply("⏳ *Midiendo velocidad del servidor...*");

      // Archivo de prueba seguro (Cloudflare)
      const url = "https://speed.cloudflare.com/__down?bytes=25000000"; // 25MB

      const start = Date.now();
      let bytes = 0;

      const res = await axios({
        url,
        method: "GET",
        responseType: "stream",
        timeout: 30000
      });

      res.data.on("data", chunk => {
        bytes += chunk.length;
      });

      res.data.on("end", () => {
        const seconds = (Date.now() - start) / 1000;
        const mbps = ((bytes * 8) / seconds / 1024 / 1024).toFixed(2);

        m.reply(
`⚡ *SPEEDTEST DEL SERVIDOR*
────────────────────
📥 Descarga: *${mbps} Mbps*
📦 Datos: ${(bytes / 1024 / 1024).toFixed(2)} MB
🕒 Tiempo: ${seconds.toFixed(2)} s

👨‍💻 Creador: *devyer*`
        );
      });

    } catch (e) {
      console.error("SPEED ERROR:", e);
      m.reply("❌ No se pudo medir la velocidad del servidor.");
    }
  }
};
