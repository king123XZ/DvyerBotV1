// ❆ YTMP3 REAL – ESTABLE
import { exec } from "child_process"
import fs from "fs"
import path from "path"

export default {
  command: ["ytmp3"],
  run: async (client, m, args) => {
    const url = args[0]
    if (!url) return m.reply("❌ Usa: *.ytmp3 <link de YouTube>*")

    const id = Date.now()
    const file = path.resolve(`./tmp_${id}.mp3`)

    await m.reply("⏳ Descargando audio...")

    const cmd = `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${file}" "${url}"`

    exec(cmd, async (err) => {
      if (err || !fs.existsSync(file)) {
        console.error(err)
        return m.reply("❌ Error al descargar")
      }

      await client.sendMessage(
        m.chat,
        {
          document: fs.readFileSync(file),
          mimetype: "audio/mpeg",
          fileName: "audio.mp3"
        },
        { quoted: m }
      )

      fs.unlinkSync(file)
    })
  }
}

