const fs = require("fs")
const path = require("path")

global.comandos = new Map()

const COMMANDS_DIR = path.join(process.cwd(), "commands")

function loadCommands(dir) {
  let files
  try {
    files = fs.readdirSync(dir)
  } catch {
    return
  }

  for (const file of files) {
    const fullPath = path.join(dir, file)

    if (fs.statSync(fullPath).isDirectory()) {
      loadCommands(fullPath)
      continue
    }

    if (!file.endsWith(".js")) continue

    try {
      delete require.cache[require.resolve(fullPath)]
      const cmd = require(fullPath)

      if (!cmd || typeof cmd.run !== "function" || !cmd.name) {
        console.log("⚠️ Comando inválido:", fullPath)
        continue
      }

      global.comandos.set(cmd.name, cmd)

    } catch (err) {
      console.log("❌ Comando con error (IGNORADO):", fullPath)
      console.log("   ↳", err.message)
    }
  }
}

module.exports = () => {
  global.comandos.clear()
  loadCommands(COMMANDS_DIR)
  console.log(`✅ ${global.comandos.size} comandos cargados`)
}
