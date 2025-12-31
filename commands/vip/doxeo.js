const axios = require("axios")
const cheerio = require("cheerio")

module.exports = {
  command: ["dni"],
  run: async (client, m, args) => {
    const cmd = m.command

    if (cmd === "dni") {
      const dni = args[0]

      if (!dni)
        return m.reply("❌ Usa: *.dni 12345678*")

      if (!/^\d{8}$/.test(dni))
        return m.reply("❌ El DNI debe tener 8 números")

      try {
        await m.reply("⏳ Consultando DNI...")

        const url = `https://eldni.com/pe/buscar-datos-por-dni?dni=${dni}`

        const { data } = await axios.get(url, {
          headers: {
            "User-Agent": "Mozilla/5.0"
          }
        })

        const $ = cheerio.load(data)

        const nombres = $("td:contains('Nombres')").next().text().trim()
        const paterno = $("td:contains('Apellido Paterno')").next().text().trim()
        const materno = $("td:contains('Apellido Materno')").next().text().trim()

        if (!nombres)
          return m.reply("❌ No se encontraron datos para ese DNI")

        return m.reply(
`🔍 *CONSULTA DNI*

🪪 DNI: ${dni}
👤 Nombres: ${nombres}
📛 Apellido Paterno: ${paterno}
📛 Apellido Materno: ${materno}

⚠️ Uso personal`
        )

      } catch (err) {
        console.error(err)
        return m.reply("❌ Error al consultar el DNI")
      }
    }
  }
}