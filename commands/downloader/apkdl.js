module.exports = {
  onButton: async (client, m) => {
    if (!m.buttonId) return;
    if (!m.buttonId.startsWith("apkdl_")) return;

    const index = parseInt(m.buttonId.split("_")[1]);
    const apps = global.apkStore?.[m.chat];

    if (!apps || !apps[index]) {
      return client.sendMessage(m.chat, { text: "⚠️ App no encontrada." });
    }

    const app = apps[index];

    let txt = `⬇️ *DESCARGA APK*\n\n`;
    txt += `📦 Nombre: ${app.name}\n`;
    txt += `🧩 Versión: ${app.version}\n`;
    txt += `📱 Paquete: ${app.package}\n\n`;
    txt += `🔗 Link directo:\n${app.download}`;

    client.sendMessage(m.chat, { text: txt }, { quoted: m });
  },
};
