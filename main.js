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

// 📌 Evita cargar comandos 2 veces
if (!global.comandos) {
  global.comandos = new Map();
  seeCommands();
}

module.exports = async (client, m) => {
  let body = "";

  // ---------------------------
  //  🔥 SISTEMA DE CAPTURA DE TEXTO (OPTIMIZADO)
  // ---------------------------
  if (m.message) {
    const msg = m.message;

    body =
      msg.conversation ||
      msg.extendedTextMessage?.text ||
      msg.imageMessage?.caption ||
      msg.videoMessage?.caption ||
      msg.buttonsResponseMessage?.selectedButtonId ||
      msg.listResponseMessage?.singleSelectReply?.selectedRowId ||
      msg.templateButtonReplyMessage?.selectedId ||
      "";
  }

  initDB(m);
  antilink(client, m);

  // ---------------------------
  //  🔥 PREFIX DEFINIDO
  // ---------------------------
  const prefixes = [".", "!", "#", "/"];
  const prefix = prefixes.find((p) => body.startsWith(p));
  if (!prefix) return;

  const commandName = body.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase();
  const args = body.trim().split(/ +/).slice(1);
  const text = args.join(" ");

  const chatId = m.key.remoteJid;
  const pushname = m.pushName || "Sin nombre";
  const botJid = client.user.id.split(":")[0] + "@s.whatsapp.net";

  // ---------------------------
  //  🔥 SI EL COMANDO NO EXISTE
  // ---------------------------
  if (!global.comandos.has(commandName)) return;

  const cmdData = global.comandos.get(commandName);

  // ---------------------------
  //  🔥 INFORMACIÓN DE GRUPO
  // ---------------------------
  let isAdmins = false;
  let isBotAdmins = false;

  if (m.isGroup) {
    const group = await client.groupMetadata(chatId).catch(() => null);

    if (group) {
      const admins = group.participants.filter(
        (p) => p.admin === "admin" || p.admin === "superadmin"
      );

      const resolved = await Promise.all(
        admins.map((adm) =>
          resolveLidToRealJid(adm.jid, client, chatId).then((real) => ({
            ...adm,
            jid: real,
          }))
        )
      );

      isAdmins = resolved.some((a) => a.jid === m.sender);
      isBotAdmins = resolved.some((a) => a.jid === botJid);
    }
  }

  // ---------------------------
  //  🔥 FILTROS DE PERMISOS
  // ---------------------------
  if (cmdData.isOwner && !global.owner.includes(m.sender.split("@")[0]))
    return m.reply("Solo el owner puede usar este comando");

  if (cmdData.isGroup && !m.isGroup)
    return m.reply("Este comando es solo para grupos");

  if (cmdData.isAdmin && !isAdmins)
    return m.reply("Necesitas ser admin");

  if (cmdData.isBotAdmin && !isBotAdmins)
    return m.reply("Necesito ser admin para ejecutar esto");

  if (cmdData.isPrivate && m.isGroup)
    return m.reply("Este comando solo funciona en privado");

  // ---------------------------
  //  🔥 EJECUTAR COMANDO
  // ---------------------------
  try {
    await cmdData.run(client, m, args, { text });
  } catch (e) {
    console.error("❌ Error ejecutando comando:", e);
    await client.sendMessage(chatId, { text: "Error en el comando" });
  }

  // ---------------------------
  //  🔥 LOG BONITO EN CONSOLA
  // ---------------------------
  const logLine = chalk.bold.blue("************************************");
  console.log(`
${logLine}
* Fecha: ${moment().format("DD/MM/YY HH:mm:ss")}
* Usuario: ${pushname}
* Chat: ${chatId}
* Comando Ejecutado: ${commandName}
${logLine}
`);
};

// Auto-reload
const mainFile = require.resolve(__filename);
fs.watchFile(mainFile, () => {
  fs.unwatchFile(mainFile);
  console.log(chalk.yellowBright(`Se actualizó ${path.basename(__filename)}, recargando...`));
  delete require.cache[mainFile];
  require(mainFile);
});
