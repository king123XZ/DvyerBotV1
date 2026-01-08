const fs = require("fs")
const path = require("path")

global.comandos = new Map()

function loadCommands(dir = "./commands") {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const full = path.join(dir, file)

    if (fs.statSync(full).isDirectory()) {
      loadCommands(full)
    } else if (file.endsWith(".js")) {
      delete require.cache[require.resolve(full)]
      const cmd = require(full)

      if (!cmd?.name || typeof cmd.run !== "function") continue

      global.comandos.set(cmd.name, cmd)
    }
  }
}

module.exports = () => {
  global.comandos.clear()
  loadCommands()
  console.log(`✅ ${global.comandos.size} comandos cargados`)
}
