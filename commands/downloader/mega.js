import { File } from 'megajs'
import mime from 'mime-types'

let handler = async (m, { conn, text }) => {
    try {
        if (!text) return m.reply('❌ Ingresa un enlace de Mega válido.')

        // Crear archivo desde la URL de Mega
        const file = File.fromURL(text)
        await file.loadAttributes()

        // Obtener extensión y tipo MIME
        const fileExtension = file.name.split('.').pop().toLowerCase()
        const mimeType = mime.lookup(fileExtension) || 'application/octet-stream'

        // Crear mensaje de información
        let caption = `
🗂️ *Información del archivo Mega*
──────────────────────────────
📛 Nombre: ${file.name}
💾 Tamaño: ${formatBytes(file.size)}
📄 Tipo: ${mimeType}
──────────────────────────────
`.trim()

        await conn.reply(m.chat, caption, m)

        // Limitar tamaño de archivo
        if (file.size >= 1800000000 && !file.directory) 
            return m.reply('❌ Error: El archivo es demasiado pesado (>1.8 GB).')

        // Descargar archivo y enviarlo
        const data = await file.downloadBuffer()
        await conn.sendFile(m.chat, data, file.name, null, m, null, {
            mimeType,
            asDocument: true
        })

    } catch (error) {
        console.error(error)
        return m.reply(`❌ Error al descargar: ${error.message}`)
    }
}

// Configuración del comando
handler.help = ['mega']
handler.tags = ['downloader']
handler.command = /^(mega)$/i
export default handler

// Función para formatear bytes
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
