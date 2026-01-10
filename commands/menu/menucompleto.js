module.exports = {
  command: ["menu", "help", "comandos"],
  categoria: "informacion",

  run: async (client, m) => {
    let text = `👾 *MENÚ DEL BOT*
──────────────────\n`

    const categorias = {}
    const usados = new Set() // 👈 evita duplicados

    for (let cmd of global.comandos.values()) {

      // solo comandos con categoria
      if (!cmd.categoria) continue

      // usar el archivo como identificador
      const tag = Array.isArray(cmd.command)
        ? cmd.command[0]
        : cmd.command

      // ❌ si ya fue agregado, saltar
      if (usados.has(tag)) continue
      usados.add(tag)

      const categoria = cmd.categoria.toLowerCase()

      if (!categorias[categoria]) {
        categorias[categoria] = []
      }

      categorias[categoria].push(tag)
    }

    if (!Object.keys(categorias).length) {
      return m.reply("⚠️ No hay comandos con categoría.")
    }

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
