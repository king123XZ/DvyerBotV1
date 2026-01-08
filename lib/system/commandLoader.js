const fs = require("fs")
const path = require("path")

global.comandos = new Map()

const COMMANDS_DIR = path.join(process.cwd(), "commands")

// archivos que NO son comandos
const IGNORE_FILES = [
  "antilink.js",
  "yt.js",
  "mega.js",
  "subbot.js"
]

function isCommand(cmd) {
  return (
    typeof cmd === "function" ||
    (cmd &&
      (Array.isArray(cmd.command) ||
        Array.isArray(cmd.help) ||
        typeof cmd.run === "function"))
  )
}

function register(cmd) {
  const names =
    cmd.command ||
    cmd.help ||
    (typeof cmd === "function" ? cmd.command : null)

  if (!Array.isArray(names)) return

  for (const name of names) {
    global.comandos.set(name.toLowerCase(), {
      ...cmd,
      run: cmd.run || cmd
    })
  }
}

function loadCommands(dir) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const fullPath = path.join(dir, file)

    if (fs.statSync(fullPath).isDirectory()) {
      loadCommands(fullPath)
      continue
    }

    if (!file.endsWith(".js")) continue
    if (IGNORE_FILES.includes(file)) continue

    try {
      delete require.cache[require.resolve(fullPath)]
      const cmd = require(fullPath)

      if (!isCommand(cmd)) continue

      register(cmd)

    } catch (err) {
      console.log("❌ Error en comando:", fullPath)
      console.log("   ↳", err.message)
    }
  }
}

module.exports = () => {
  global.comandos.clear()
  loadCommands(COMMANDS_DIR)
  console.log(`✅ ${global.comandos.size} comandos cargados`)
}
