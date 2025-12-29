const os = require("os");
const pkg = require("../../package.json");

module.exports = {
  command: ["info"],
  category: "general",
  run: async (client, m, args, from) => {

    const up = process.uptime();
    const h = Math.floor(up / 3600);
    const min = Math.floor((up % 3600) / 60);
    const s = Math.floor(up % 60);
    const cpu = os.cpus()[0]?.model.trim() || "Desconocido";
    const cores = os.cpus().length;
    const mem = [
      (os.freemem() / 1024 / 1024).toFixed(0),
      (os.totalmem() / 1024 / 1024).toFixed(0),
    ];
    const platform = `${os.platform()} ${os.release()} (${os.arch()})`;
    const nodeV = process.version;
    const host = os.hostname();
    const shell = process.env.SHELL || process.env.COMSPEC || "desconocido";


    const now = new Date().toLocaleString("en-US", {
      timeZone: "America/Mexico_City",
      hour12: false,
    });

    const info = `
╔══════════════════════╗
      🤖 KILLUA-BOT V.100
       Creado por DVYER
╚══════════════════════╝

📌 *Versión:* ${pkg.version}
⏱ *Uptime:* ${h}h ${min}m ${s}s
💻 *Plataforma:* ${platform}
🖥 *Node.js:* ${nodeV}
🏠 *Host:* ${host}
⚙ *Shell:* ${shell}

🧠 *CPU:* ${cpu} (${cores} núcleos)
💾 *Memoria:* ${mem[0]} MiB libre / ${mem[1]} MiB total

🗓 *Fecha & Hora:* ${now}
`;

    const buttons = [
      { buttonId: ".menu", buttonText: { displayText: "🏠 Menú Principal" }, type: 1 },
      { buttonId: ".canal", buttonText: { displayText: "📢 Canal" }, type: 1 } // botón opcional
    ];

 
    await client.sendMessage(
      m.chat,
      {
        image: { url: "https://i.ibb.co/fdFtWCkC/info-bot.png" },
        caption: info,
        footer: "YerTX Bot • DVYER",
        buttons: buttons,
        headerType: 4
      },
      { quoted: m }
    );
  },
};

