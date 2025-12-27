const axios = require("axios");

module.exports = {
  command: ["speed", "internet", "velocidad"],
  description: "Mide la velocidad de internet del servidor",

  run: async (client, m) => {
    try {
      await m.reply("⏳ *Midiendo velocidad del servidor...*");

      const url = "https://speed.hetzner.de/100MB.bin";
      const inicio = Date.now();

      const response = await axios({
        url,
        method: "GET",
        responseType: "stream",
        timeout: 30000
      });

      let bytes = 0;
      response.data.on("data", chunk => {
        bytes += chunk.length;
      });

      response.data.on("end", () => {
        const tiempo = (Date.now() - inicio) / 1000;
        const mbps = ((bytes * 8) / tiempo / 1024 / 1024).toFixed(2);

        m.reply(
`⚡ *SPEEDTEST DEL SERVIDOR*
────────────────────
📥 Descarga: *${mbps} Mbps*
🕒 Tiempo: ${tiempo.toFixed(2)}s

👨‍💻 Creador: *devyer*`
        );
      });

    } catch (err) {
      console.error(err);
      m.reply("❌ Error al medir la velocidad del servidor.");
    }
  }
};
