// ===============================
//  COMANDO DESVISTA.JS 100% COMPATIBLE CON BAILEYS
// ===============================

export const command = {
    name: "desvista",
    alias: ["desactivarvista", "desvista"],
    description: "Activa o desactiva el Anti-ViewOnce",
    run: async (sock, m, args, store) => {
        global.antiViewOnce = global.antiViewOnce ?? true;

        const text = args[0];
        const chat = m.key.remoteJid;

        if (!text) {
            return await sock.sendMessage(chat, {
                text: "Uso correcto:\n.desvista on\n.desvista off"
            });
        }

        if (text === "on") {
            global.antiViewOnce = true;
            await sock.sendMessage(chat, { text: "🟢 Anti-ViewOnce ACTIVADO" });
        }

        else if (text === "off") {
            global.antiViewOnce = false;
            await sock.sendMessage(chat, { text: "🔴 Anti-ViewOnce DESACTIVADO" });
        }

        else {
            await sock.sendMessage(chat, {
                text: "Comando no válido. Usa:\n.desvista on\n.desvista off"
            });
        }
    }
};
