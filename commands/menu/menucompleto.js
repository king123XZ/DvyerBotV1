module.exports = {
  command: ["menu_completo"],
  categoria: "informacion",

  run: async (client, m) => {

    const categorias = {}
    const usados = new Set()

    for (let cmd of global.comandos.values()) {
      if (!cmd.categoria) continue

      const tag = Array.isArray(cmd.command)
        ? cmd.command[0]
        : cmd.command

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

    // 🧠 header
    let text = `
╭─❒ 👾 *KILLUA BOT* ❒
│ 📅 Fecha: ${new Date().toLocaleDateString()}
│ ⚙️ Comandos: ${usados.size}
╰───────────────\n`

    // 🎨 emojis por categoría
    const iconos = {
      descargas: "📥",
      grupos: "👥",
      dueño: "👑",
      busqueda: "🔍",
      informacion: "ℹ️",
      utilidades: "🧰"
    }

    for (let cat in categorias) {
      const icono = iconos[cat] || "📂"

      text += `
${icono} *${cat.toUpperCase()}*
┈┈┈┈┈┈┈┈┈┈
`

      text += categorias[cat]
        .map(c => `▸ .${c}`)
        .join("\n")

      text += "\n"
    }

    text += `
╭───────────────
│ 🤖 *Killua Bot*
│ 💬 Usa: .menu_completo
╰───────────────`

    m.reply(text.trim())
  }
}
