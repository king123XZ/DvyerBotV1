/**
 *  🔥 Comando Sub-Bot
 *  Crea un código oficial de emparejamiento de WhatsApp para sub-bots
 *  Solo los números autorizados pueden generar el código
 */

const { default: makeWASocket } = require("@whiskeysockets/baileys");
const { exec } = require("child_process");

module.exports = {
  command: ["subbot"],
  description: "Genera código oficial de WhatsApp para vincular sub-bot",
  run: async (client, m) => {
    try {
      // Lista de números autorizados para pedir sub-bot
      const allowedUsers = [
        "51907376960@s.whatsapp.net", // Tu número principal
        "51917391317@s.whatsapp.net", // Número autorizado 2
      ];

      if (!allowedUsers.includes(m.sender)) {
        return client.sendMessage(m.chat, { text: "❌ No estás autorizado para usar este comando." });
      }

      // Pedir el código de emparejamiento
      const phoneNumber = m.sender.split("@")[0]; // número que quiere ser sub-bot
      let pairingCode;

      try {
        pairingCode = await client.requestPairingCode(phoneNumber, "1234MINI"); // clave temporal, WhatsApp oficial
      } catch (err) {
        console.log("Error generando código:", err);
        return client.sendMessage(m.chat, { text: "❌ Error al generar el código de emparejamiento." });
      }

      // Enviar el código al chat
      await client.sendMessage(m.chat, { 
        text: `✅ Tu código de emparejamiento para sub-bot es:\n\n*${pairingCode}*\n\nIngresa este código en WhatsApp para vincular el sub-bot.` 
      });

    } catch (err) {
      console.log("Error en sub-bot:", err);
      client.sendMessage(m.chat, { text: "❌ Ocurrió un error inesperado." });
    }
  }
};
