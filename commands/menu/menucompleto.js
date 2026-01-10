module.exports = {
  command: ["menu", "help", "comandos"],
  categoria: "informacion",

  run: async (client, m) => {
    let text = `👾 *MENÚ DEL BOT*
──────────────────\n`

    const categorias = {}

    // recorrer comandos cargados
    for (let cmd of global.comandos.values()) {

      // ❌ si NO tiene categoria, no se muestra
      if (!cmd.categoria) continue

      const categoria = cmd.categoria.toLowerCase()

      if (!categorias[categoria]) {
        categorias[categoria] = []
      }

      // tag principal
      const tag = Array.isArray(cmd.command)
        ? cmd.command[0]
        : cmd.command

      categorias[categoria].push(tag)
    }

    if (Object.keys(categorias).length === 0) {
      return m.reply("⚠️ No hay comandos con categoría definida.")
    }

    // construir menú
    for (let cat in categorias) {
      text += `\n📂 *${cat.toUpperCase()}*\n`
      text += categorias[cat]
        .map(c => `• .${c}`)
        .join("\n")
      text += "\n"
    }

    text += `\n──────────────────
🤖 Killua Bot`

    m.reply(text)
  }
}
