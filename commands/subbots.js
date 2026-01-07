// commands/subbots.js

function cleanJidToNumber(jid = "") {
  return String(jid).split("@")[0].split(":")[0];
}

async function run(client, m, args, ctx) {
  try {
    if (!global.subBots) global.subBots = new Map();

    const mainJid = client?.user?.id || "";
    const mainNumber = cleanJidToNumber(mainJid);

    const subs = Array.from(global.subBots.entries()); // [number, sock]

    if (!subs.length) {
      return m.reply(
        `📱 *Bot principal:* ${mainNumber || "Desconocido"}\n` +
        `🤖 *SubBots conectados:* 0\n\n` +
        `No hay subbots activos.`
      );
    }

    const lines = subs.map(([num, sock], i) => {
      const sockJid = sock?.user?.id || "";
      const sockNumber = cleanJidToNumber(sockJid) || num;
      const isOpen = !!sock?.ws && sock?.ws?.readyState === 1; // 1 = OPEN
      return `${i + 1}. ${sockNumber} ${isOpen ? "✅" : "⚠️"}`;
    });

    return m.reply(
      `📱 *Bot principal:* ${mainNumber || "Desconocido"}\n` +
      `🤖 *SubBots conectados:* ${subs.length}\n\n` +
      `*Lista:*\n` +
      lines.join("\n")
    );
  } catch (e) {
    console.error(e);
    return m.reply("❌ Error mostrando subbots.");
  }
}

module.exports = {
  command: ["subbots", "bots", "listbots"],
  run,
};
