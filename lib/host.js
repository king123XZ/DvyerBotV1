const fs = require("fs");
const path = require("path");

const settingsPath = path.join(__dirname, "../settings.js");

/**
 * Obtiene el hosting actual
 */
function getHosting() {
  return global.hosting || "otro";
}

/**
 * Cambia el hosting y lo guarda en settings.js
 */
function setHosting(value) {
  try {
    if (!fs.existsSync(settingsPath)) return false;

    let data = fs.readFileSync(settingsPath, "utf8");

    // Si ya existe global.hosting, lo reemplaza
    if (data.includes("global.hosting")) {
      data = data.replace(
        /global\.hosting\s*=\s*["'`](.*?)["'`]/,
        `global.hosting = "${value}"`
      );
    } else {
      // Si no existe, lo agrega al inicio
      data = `global.hosting = "${value}";\n` + data;
    }

    fs.writeFileSync(settingsPath, data, "utf8");

    // actualizar en memoria
    global.hosting = value;

    return true;
  } catch (err) {
    console.error("Error setHosting:", err);
    return false;
  }
}

module.exports = {
  getHosting,
  setHosting
};
