const fs = require("fs");
const chalk = require("chalk");

global.owner = ["51917391317","51907376960"]; 
global.sessionName = "DevYer_session";
global.version = "v2.0.0 | devYer";
global.namebot = "dvyer - kali";
global.author = "dvyer | kali";

global.mess = {
  admin: "→ Esta función está reservada para los administradores del grupo",
  botAdmin: "→ Para ejecutar esta función debo ser administrador",
  owner: "→ Solo mi creador puede usar este comando",
  group: "→ Esta función solo funciona en grupos",
  private: "→ Esta función solo funciona en mensajes privados",
  wait: "→ Espera un momento...",
};

global.thumbnailUrl = "https://i.ibb.co/JR8Qz9j6/20251204-0617-Retrato-Misterioso-Mejorado-remix-01kbmh4newf9k8r1r0bafmxr46.png"; //Cambia esta imagen

global.my = {
  ch: "https://whatsapp.com/channel/0029VaH4xpUBPzjendcoBI2c"
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.yellowBright(`Actualización '${__filename}'`));
  delete require.cache[file];
  require(file);
});
