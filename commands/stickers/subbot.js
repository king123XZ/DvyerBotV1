/**
 * 🔹 Comando para iniciar un sub-bot
 * Solo números autorizados pueden usarlo
 * Código de emparejamiento obligatorio
 * Creado por Dvyer
 */

const { useMultiFileAuthState, fetchLatestBaileysVersion, default: makeWASocket } = require("@whiskeysockets/baileys");
const pino = require("pino");

module.exports = {
  command: ["subbot"],
  description: "Convierte tu número en sub-bot (solo números autorizados)",

  run: async (client, m) => {
    try {
      // Lista de números autorizados (sin @s.whatsapp.net)
      const authorizedNumbers = [
        "51907376960", // Bot principal / autorizado
        "51917391317", // Sub-bot 1
        "519XXXXXXXXX" // Sub-bot 2 (reemplazar con el número real)
      ]; 

      const senderNumber = m.sender.split("@")[0];

      if (!authorizedNumbers.includes(senderNumber)) {
        return client.sendMessage(m.chat, { text: "❌ No estás autorizado para iniciar un sub-bot." });
      }

      // Pedir código de emparejamiento
      await client.sendMessage(m.chat, { text: "🔑 Ingresa tu código de emparejamiento para iniciar el sub-bot:" });

      // Esperar respuesta del usuario
      const filter = (msg) => msg.key.fromMe === false && msg.key.remoteJid === m.chat;
      const collected = await new Promise((resolve) => {
        const handler = async (msg) => {
          if (filter(msg)) {
            resolve(msg);
            client.ev.off("messages.upsert", handler);
          }
        };
        client.ev.on("messages.upsert", handler);
      });

      const pairingCode = collected.message?.conversation || collected.message?.extendedTextMessage?.text;
      if (!pairingCode) return;

      // Iniciar sub-bot
      const { state, saveCreds } = await useMultiFileAuthState(`subbot_${senderNumber}`);
      const { version } = await fetchLatestBaileysVersion();

      const subBot = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        browser: ["SubBot", "Chrome", "1.0"],
        auth: state,
      });

      // Guardar credenciales automáticamente
      subBot.ev.on("creds.update", saveCreds);

      client.sendMessage(m.chat, { text: "✅ Sub-bot iniciado correctamente." });

      console.log(`Sub-bot iniciado para ${senderNumber} con código ${pairingCode}`);

    } catch (err) {
      console.error("Error al iniciar sub-bot:", err);
      client.sendMessage(m.chat, { text: "❌ Ocurrió un error al intentar iniciar el sub-bot." });
    }
  },
};
