const { useMultiFileAuthState, fetchLatestBaileysVersion, default: makeWASocket } = require("@whiskeysockets/baileys");
const pino = require("pino");

module.exports = {
  command: ["subbot"],
  description: "Convierte tu número en sub-bot (solo números autorizados)",

  run: async (client, m) => {
    try {
      const authorizedNumbers = [
        "51907376960",
        "51917391317",
        "519XXXXXXXXX" // reemplazar
      ];

      const senderNumber = m.sender.split("@")[0];
      if (!authorizedNumbers.includes(senderNumber)) return;

      await client.sendMessage(m.chat, { text: "🔑 Envia tu código de emparejamiento para iniciar el sub-bot." });

      // Escuchar solo el siguiente mensaje de ese usuario
      const handler = async ({ messages }) => {
        let msg = messages[0];
        if (!msg.message || !msg.key) return;

        if (msg.key.remoteJid === m.chat && !msg.key.fromMe) {
          const pairingCode = msg.message.conversation || msg.message.extendedTextMessage?.text;
          if (!pairingCode) return;

          const { state, saveCreds } = await useMultiFileAuthState(`subbot_${senderNumber}`);
          const { version } = await fetchLatestBaileysVersion();

          const subBot = makeWASocket({
            version,
            logger: pino({ level: "silent" }),
            printQRInTerminal: false,
            browser: ["SubBot", "Chrome", "1.0"],
            auth: state,
          });

          subBot.ev.on("creds.update", saveCreds);
          await client.sendMessage(m.chat, { text: "✅ Sub-bot iniciado correctamente." });

          console.log(`Sub-bot iniciado para ${senderNumber} con código: ${pairingCode}`);

          // Quitar el listener después de usarlo
          client.ev.off("messages.upsert", handler);
        }
      };

      client.ev.on("messages.upsert", handler);

    } catch (err) {
      console.error("Error al iniciar sub-bot:", err);
      client.sendMessage(m.chat, { text: "❌ Error al iniciar el sub-bot." });
    }
  },
};
