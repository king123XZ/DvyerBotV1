
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
const cooldown = require("./lib/cooldown"); // 🧠 ANTI-SPAM

// Cargamos comandos al iniciar
seeCommands();

/* ================= MAIN HANDLER ================= */
const mainHandler = async (client, m) => {
  try {
    if (!m?.message) return;

    /* ===== BODY ===== */
    let body =
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      m.message.imageMessage?.caption ||
      m.message.videoMessage?.caption ||
      m.message.buttonsResponseMessage?.selectedButtonId ||
      m.message.listResponseMessage?.singleSelectReply?.selectedRowId ||
      m.message.templateButtonReplyMessage?.selectedId ||
      "";

    if (!body) return;

    /* ===== DB SAFE ===== */
    try {
      initDB(m);
    } catch (e) {
      console.log("DB error:", e);
    }

    /* ===== PREFIX ===== */
    const prefixes = [".", "!", "#", "/"];
    const prefix = prefixes.find(p => body.startsWith(p));
    if (!prefix) return;

    const args = body.trim().split(/ +/).slice(1);
    const text = args.join(" ");
    const command = body.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase();

    /* ===== INFO ===== */
    const pushname = m.pushName || "Sin nombre";
    const sender = m.sender || m.key?.participant || m.key?.remoteJid;
    if (!sender) return;

    const from = m.chat;
    const botJid = client.user?.id?.split(":")[0] + "@s.whatsapp.net";

    /* ===== ADMINS ===== */
    let isAdmins = false;
    let isBotAdmins = false;
    let groupName = "";

    if (m.isGroup) {
      const metadata = await client.groupMetadata(from).catch(() => null);
      if (metadata) {
        groupName = metadata.subject || "";
        const admins = metadata.participants.filter(p =>
          p.admin === "admin" || p.admin === "superadmin"
        );

        const resolvedAdmins = await Promise.all(
          admins.map(async (a) => {
            return resolveLidToRealJid(a.jid, client, from).catch(() => a.jid);
          })
        );

        isAdmins = resolvedAdmins.includes(sender);
        isBotAdmins = resolvedAdmins.includes(botJid);
      }

      // 🔗 ANTILINK
      try {
        await antilink(client, m);
      } catch {}
    }

    /* ===== BUSCAR COMANDO ===== */
    if (!global.comandos?.has(command)) return;
    const cmd = global.comandos.get(command);

    /* ===== LOG ===== */
    console.log(
      chalk.black(
        chalk.bgCyan(` CMD: ${command} `)
      ),
      chalk.white(`de ${pushname}`),
      chalk.gray(`en ${m.isGroup ? groupName : "Privado"}`)
    );

    /* ===== OWNER ===== */
    const isOwner = global.owner
      .map(n => n + "@s.whatsapp.net")
      .includes(sender);

    if (cmd.isOwner && !isOwner) return m.reply("⚠️ Solo el owner.");
    if (cmd.isGroup && !m.isGroup) return m.reply("⚠️ Solo en grupos.");
    if (cmd.isAdmin && !isAdmins) return m.reply("⚠️ Debes ser admin.");
    if (cmd.isBotAdmin && !isBotAdmins) return m.reply("⚠️ Necesito admin.");

    /* ===== COOLDOWN (ANTI-SPAM) ===== */
    const wait = cooldown(sender, command, cmd.cooldown || 5);
    if (wait) {
      return m.reply(`⏳ Espera *${wait}s* antes de usar *${command}*`);
    }

    /* ===== EJECUCIÓN ===== */
    try {
      if (cmd.run) {
        await cmd.run(client, m, args, { text, prefix, command });
      } else if (cmd.execute) {
        await cmd.execute(client, m, args, { text, prefix, command });
      }
    } catch (err) {
      console.log(chalk.red("Error en comando:"), err);
      m.reply("❌ Error al ejecutar el comando.");
    }

  } catch (fatal) {
    console.log("🔥 FATAL MAIN ERROR:", fatal);
  }
};

/* ===== EXPORT (IMPORTANTE PARA SUBBOTS) ===== */
module.exports = mainHandler;

/* ===== AUTO SAVE DB ===== */
setInterval(async () => {
  try {
    if (global.db?.data) await global.db.write();
  } catch {}
}, 30_000);

/* ===== HOT RELOAD ===== */
const mainFile = require.resolve(__filename);
fs.watchFile(mainFile, () => {
  fs.unwatchFile(mainFile);
  delete require.cache[mainFile];
  require(mainFile);
});