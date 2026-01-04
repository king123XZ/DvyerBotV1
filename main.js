require("./settings");
const fs = require("fs");
const chalk = require("chalk");

const seeCommands = require("./lib/system/commandLoader");
const initDB = require("./lib/system/initDB");
const antilink = require("./commands/antilink");
const { resolveLidToRealJid } = require("./lib/utils");
const cooldown = require("./lib/cooldown");

// cargar comandos
seeCommands();

/* ================= MAIN HANDLER ================= */
async function mainHandler(client, m) {
  try {
    if (!m?.message) return;

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

    try { initDB(m); } catch {}

    const prefixes = [".", "!", "#", "/"];
    const prefix = prefixes.find(p => body.startsWith(p));
    if (!prefix) return;

    const args = body.trim().split(/ +/).slice(1);
    const text = args.join(" ");
    const command = body.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase();

    const sender = m.sender || m.key?.participant || m.key?.remoteJid;
    if (!sender) return;

    const from = m.chat;
    const botJid = client.user?.id?.split(":")[0] + "@s.whatsapp.net";

    let isAdmins = false;
    let isBotAdmins = false;

    if (m.isGroup) {
      const metadata = await client.groupMetadata(from).catch(() => null);
      if (metadata) {
        const admins = metadata.participants.filter(p =>
          p.admin === "admin" || p.admin === "superadmin"
        );

        const resolvedAdmins = await Promise.all(
          admins.map(a =>
            resolveLidToRealJid(a.jid, client, from).catch(() => a.jid)
          )
        );

        isAdmins = resolvedAdmins.includes(sender);
        isBotAdmins = resolvedAdmins.includes(botJid);
      }

      try { await antilink(client, m); } catch {}
    }

    if (!global.comandos?.has(command)) return;
    const cmd = global.comandos.get(command);

    const isOwner = global.owner
      .map(n => n + "@s.whatsapp.net")
      .includes(sender);

    if (cmd.isOwner && !isOwner) return m.reply("⚠️ Solo el owner.");
    if (cmd.isGroup && !m.isGroup) return m.reply("⚠️ Solo en grupos.");
    if (cmd.isAdmin && !isAdmins) return m.reply("⚠️ Debes ser admin.");
    if (cmd.isBotAdmin && !isBotAdmins) return m.reply("⚠️ Necesito admin.");

    const wait = cooldown(sender, command, cmd.cooldown || 5);
    if (wait) return m.reply(`⏳ Espera *${wait}s*`);

    await cmd.run?.(client, m, args, { text, prefix, command });

  } catch (e) {
    console.log("🔥 MAIN ERROR:", e);
  }
}

/* ===== EXPORT CORRECTO ===== */
module.exports = {
  mainHandler
};