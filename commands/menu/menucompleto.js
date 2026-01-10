module.exports = {
  command: ["menu_completo"],
  categoria: "menu",
  description: "todos los comandos del bot",

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

      categorias[categoria].push({
        nombre: tag,
        descripcion: cmd.description || "Sin descripción"
      })
    }

    if (!Object.keys(categorias).length) {
      return client.reply(
        m.chat,
        "⚠️ No hay comandos con categoría.",
        m,
        global.channelInfo
      )
    }

    // 🧠 header del texto
    let text = `
╭─❒ 👾 *KILLUA BOT* ❒
│ 📅 Fecha: ${new Date().toLocaleDateString()}
│ ⚙️ Comandos: ${usados.size}
╰───────────────\n`

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

      text += `\n${icono} *${cat.toUpperCase()}*\n┈┈┈┈┈┈┈┈┈┈\n`

      text += categorias[cat]
        .map(c => `▸ .${c.nombre}\n  ⤳ ${c.descripcion}`)
        .join("\n")

      text += "\n"
    }

    text += `
╭───────────────
│ 🤖 *Killua Bot*
│ 💬 Usa: .menu_completo
╰───────────────`

    // 🔹 Enviar como video/GIF con URL
    const videoURL = "https://raw.githubusercontent.com/IrokzDal/database/main/1768070936627.mp4" // tu video o GIF

    await client.sendMessage(
      m.chat,
      {
        video: { url: videoURL },
        caption: text.trim(),
        gifPlayback: true, // esto hace que se reproduzca como GIF
      },
      { quoted: m }
    )
  }
}
