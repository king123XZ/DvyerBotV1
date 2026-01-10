async function run(client, m, args) {
  try {
    if (!global.subBots) global.subBots = new Map();

    let number = args?.[0] ? String(args[0]) : "";
    number = number.replace(/\D/g, "");

    if (!number) return m.reply("Usa: *.subbotoff 519xxxxxxxx*");

    const sock = global.subBots.get(number);
    if (!sock) return m.reply(`⚠️ No existe subbot activo para *${number}*`);

    try { sock.end?.(); } catch {}
    global.subBots.delete(number);

    return m.reply(`✅ SubBot *${number}* apagado.`);
  } catch (e) {
    console.error(e);
    return m.reply("❌ Error apagando subbot.");
  }
}

module.exports = {
  command: ["subbotoff", "offsubbot", "suboff"],
 categoria: "subbot",
  run,
};
