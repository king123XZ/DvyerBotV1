module.exports = {
  command: ["a"],
  category: "general",

  run: async (client, m) => {
    let text = `👾 *MENÚ DEL BOT*
──────────────────\n`

    const categories = {}

    // recorrer comandos cargados
    for (let cmd of global.comandos.values()) {
      const category = cmd.category || "otros"

      if (!categories[category]) {
        categories[category] = []
      }

      // solo el primer comando como tag principal
      const tag = Array.isArray(cmd.command)
        ? cmd.command[0]
        : cmd.command

      categories[category].push(tag)
    }

    // construir menú
    for (let cat in categories) {
      text += `\n📂 *${cat.toUpperCase()}*\n`
      text += categories[cat]
        .map(c => `• .${c}`)
        .join("\n")
      text += "\n"
    }

    text += `\n──────────────────
🤖 Killua Bot`

    m.reply(text)
  }
}
