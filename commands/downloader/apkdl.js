module.exports = {
  command: ["apkdl"],

  run: async (client, m, args) => {
    if (!args[0]) return m.reply("❌ Usa: !apkdl 1");

    const index = parseInt(args[0]) - 1;
    const apps = global.apkStore?.[m.chat];

    if (!apps || !apps[index]) {
      return m.reply("⚠️ Número inválido.");
    }

    const app = apps[index];

    let txt = `⬇️ *DESCARGA APK*\n\n`;
    txt += `📦 Nombre: ${app.name}\n`;
    txt += `👨‍💻 Developer: ${app.developer}\n`;
    txt += `🧩 Versión: ${app.version}\n`;
    txt += `📱 Paquete: ${app.package}\n`;
    txt += `💾 Tamaño: ${(app.size / 1024 / 1024).toFixed(2)} MB\n\n`;
    txt += `🔗 *Link directo:*\n${app.apk}`;

    m.reply(txt);
  },
};

