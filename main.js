require("./settings");
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const chalk = require("chalk");
const gradient = require("gradient-string");

const seeCommands = require("./lib/system/commandLoader");
const initDB = require("./lib/system/initDB");
const antilink = require("./commands/antilink");
const { resolveLidToRealJid } = require("./lib/utils");

seeCommands();

module.exports = async (client, m) => {
  try {
    let body = "";

    if (!m.message) return;

    body =
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      m.message.imageMessage?.caption ||
      m.message.videoMessage?.caption ||
      m.message.buttonsResponseMessage?.selectedButtonId ||
      m.message.listResponseMessage?.singleSelectReply?.selectedRowId ||
      m.message.templateButtonReplyMessage?.selectedId ||
      "";

    // 🔒 DB seguro
    try {
      initDB(m);
    } catch (e) {
      console.log("DB error:", e);
    }

    // 🔒 Antilink SOLO en grupos
    if (m.isGroup) {
      try {
        await antilink(client, m);
      } catch (e) {
        console.log("Antilink error:", e);
      }
    }

    const prefixes = ['.', '!', '#', '/'];
    const prefix = prefixes.find(p => body.startsWith(p));
    if (!prefix) return;

    const args = body.trim().split(/ +/).slice(1);
    const text = args.join(" ");

    const command = body
      .slice(prefix.length)
      .trim()
      .split(/\s+/)[0]
      .toLowerCase();

    const pushname = m.pushName || "Sin nombre";
    const sender = m.sender || m.key?.participant || m.key?.remoteJid;
    if (!sender) return;

    const from = m.chat;
    const botJid = client.user.id.split(":")[0] + "@s.whatsapp.net";

    let isAdmins = false;
    let isBotAdmins = false;
    let groupName = "";

    if (m.isGroup) {
      const metadata = await client.groupMetadata(from).catch(() => null);
      if (metadata) {
        groupName = metadata.subject || "";

        const admins = metadata.participants.filter(
          p => p.admin === "admin" || p.admin === "superadmin"
        );

        const resolvedAdmins = await Promise.all(
          admins.map(async (a) => {
            const real = await resolveLidToRealJid(a.jid, client, from).catch(() => a.jid);
            return real;
          })
        );

        isAdmins = resolvedAdmins.includes(sender);
        isBotAdmins = resolvedAdmins.includes(botJid);
      }
    }

    // ===== LOG =====
    console.log(
      chalk.blueBright(
        `\n[CMD] ${command} | ${pushname} | ${sender} | ${m.isGroup ? groupName : "Privado"}`
      )
    );

    if (!global.comandos.has(command)) return;

    const cmd = global.comandos.get(command);

    if (cmd.isOwner &&
      !global.owner.map(n => n + "@s.whatsapp.net").includes(sender)
    ) return m.reply("⚠️ Solo el owner puede usar este comando.");

    if (cmd.isGroup && !m.isGroup)
      return m.reply("⚠️ Este comando solo funciona en grupos.");

    if (cmd.isAdmin && !isAdmins)
      return m.reply("⚠️ Necesitas ser admin.");

    if (cmd.isBotAdmin && !isBotAdmins)
      return m.reply("⚠️ Necesito admin.");

    try {
      await cmd.run(client, m, args, { text });
    } catch (err) {
      console.log("Error comando:", err);
      m.reply("❌ Error interno, pero sigo activo.");
    }

  } catch (fatal) {
    console.log("FATAL MAIN ERROR:", fatal);
  }
};

// 🔁 AUTO RELOAD
const mainFile = require.resolve(__filename);
fs.watchFile(mainFile, () => {
  fs.unwatchFile(mainFile);
  console.log(chalk.yellowBright(`\nRecargando ${path.basename(__filename)}`));
  delete require.cache[mainFile];
  require(mainFile);
});