const fs = require("fs")
const path = require("path")

global.comandos = new Map()

const COMMANDS_DIR = path.join(process.cwd(), "commands")

function loadCommands(dir) {
  const files = fs.readdirSync(dir)

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

      // 👉 CASO 1: exporta función directa
      if (typeof cmd === "function") {
        if (Array.isArray(cmd.command)) {
          for (const name of cmd.command) {
            global.comandos.set(name.toLowerCase(), {
              ...cmd,
              run: cmd
            })
          }
          continue
        }
      }

      // 👉 CASO 2: tiene run + command[]
      if (cmd.run && Array.isArray(cmd.command)) {
        for (const name of cmd.command) {
          global.comandos.set(name.toLowerCase(), cmd)
        }
        continue
      }

      // 👉 CASO 3: usa help[]
      if (cmd.run && Array.isArray(cmd.help)) {
        for (const name of cmd.help) {
          global.comandos.set(name.toLowerCase(), cmd)
        }
        continue
      }

      console.log("⚠️ Comando inválido:", fullPath)

    } catch (err) {
      console.log("❌ Error en comando (ignorado):", fullPath)
      console.log("   ↳", err.message)
    }
  }
}

module.exports = () => {
  global.comandos.clear()
  loadCommands(COMMANDS_DIR)
  console.log(`✅ ${global.comandos.size} comandos cargados`)
}
