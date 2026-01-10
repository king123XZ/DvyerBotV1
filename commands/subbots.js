const { allStates } = require("../lib/subbotRegistry");

function cleanJidToNumber(jid = "") {
  return String(jid).split("@")[0].split(":")[0];
}

function fmtTime(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${h}h ${m}m ${ss}s`;
}

async function run(client, m) {
  try {
    if (!global.subBots) global.subBots = new Map();

    const mainNumber = cleanJidToNumber(client?.user?.id || "");
    const states = allStates().sort((a, b) => (a.number > b.number ? 1 : -1));

    const connected = states.filter(s => s.status === "open").length;

    let text =
      `📱 *Bot principal:* ${mainNumber || "Desconocido"}\n` +
      `🤖 *SubBots:* ${states.length} (conectados: ${connected})\n\n`;

    if (!states.length) {
      return m.reply(text + "No hay subbots activos.");
    }

    const now = Date.now();

    text += "*Lista:*\n";
    text += states
      .map((s, i) => {
        const alive = global.subBots.has(s.number);
        const uptime = fmtTime(now - (s.startedAt || now));
        const last = fmtTime(now - (s.lastChange || now));
        return (
          `${i + 1}. *${s.number}* ${s.status === "open" ? "✅" : "⚠️"}\n` +
          `   Estado: ${s.status} | Vivo: ${alive ? "sí" : "no"}\n` +
          `   Uptime: ${uptime} | Último cambio: hace ${last}`
        );
      })
      .join("\n\n");

    return m.reply(text);
  } catch (e) {
    console.error(e);
    return m.reply("❌ Error mostrando subbots.");
  }
}

module.exports = {
  command: ["subbots", "bots", "listbots"],
   categoria: "descarga",
  run,
};
