const fetch = require('node-fetch');
const cheerio = require('cheerio');

const handler = async (m, { text, conn, usedPrefix }) => {
    // Inicializar conn.xnxx para evitar errores
    conn.xnxx = conn.xnxx || {};

    if (!text) return m.reply('❀ Por favor, ingresa el título o URL del video de *(xnxx)*.');

    const isUrl = text.includes('xnxx.com');

    if (isUrl) {
        try {
            await m.react('🕒');
            const res = await xnxxdl(text);
            const { dur, qual, views } = res.result.info;
            const txt = `*乂 ¡XNXX - DOWNLOAD! 乂*\n\n≡ Título : ${res.result.title}\n≡ Duración : ${dur || 'Desconocida'}\n≡ Calidad : ${qual || 'Desconocida'}\n≡ Vistas : ${views || 'Desconocidas'}`;
            const dll = res.result.files.high || res.result.files.low;
            await conn.sendFile(m.chat, dll, res.result.title + '.mp4', txt, m);
            await m.react('✔️');
        } catch (e) {
            await m.react('✖️');
            await conn.reply(m.chat, `⚠︎ Error al descargar el video.\n> Usa *${usedPrefix}report* para informarlo.\n\n` + e, m);
        }
        return;
    }

    // Buscar video por texto
    const res = await search(encodeURIComponent(text));
    await m.react('🕒');
    if (!res.result?.length) return m.reply('ꕥ No se encontraron resultados.');
    await m.react('✔️');

    const list = res.result.slice(0, 10)
        .map((v, i) => `*${i + 1}*\n≡ Título : *${v.title}*\n≡ Link : ${v.link}`).join('\n\n');

    const caption = `*乂 ¡XNXX - SEARCH! 乂*\n\n${list}\n\n> » Responde con el número + n para descargar uno de los vídeos o usa la URL directamente.`;
    const { key } = await conn.sendMessage(m.chat, { text: caption }, { quoted: m });

    // Guardar sesión para descarga
    conn.xnxx[m.sender] = {
        result: res.result,
        key,
        downloads: 0,
        timeout: setTimeout(() => delete conn.xnxx[m.sender], 120_000)
    };
};

handler.before = async (m, { conn }) => {
    conn.xnxx = conn.xnxx || {};
    const session = conn.xnxx[m.sender];
    if (!session || !m.quoted || m.quoted.id !== session.key.id) return;

    const n = parseInt(m.text.trim());
    if (isNaN(n) || n < 1 || n > session.result.length) {
        await m.reply('ꕥ Por favor, ingresa un número válido.');
        return;
    }

    try {
        await m.react('🕒');
        const link = session.result[n - 1].link;
        const res = await xnxxdl(link);
        const { dur, qual, views } = res.result.info;
        const txt = `*乂 ¡XNXX - DOWNLOAD! 乂*\n\n≡ Título : ${res.result.title}\n≡ Duración : ${dur || 'Desconocida'}\n≡ Calidad : ${qual || 'Desconocida'}\n≡ Vistas : ${views || 'Desconocidas'}`;
        const dll = res.result.files.high || res.result.files.low;
        await conn.sendFile(m.chat, dll, res.result.title + '.mp4', txt, m);
        await m.react('✔️');
    } catch (e) {
        await m.reply(m.chat, `⚠︎ Error al descargar el video.\n> Usa *${usedPrefix}report* para informarlo.\n\n` + e, m);
        await m.react('✖️');
    } finally {
        session.downloads++;
        if (session.downloads >= 5) {
            clearTimeout(session.timeout);
            delete conn.xnxx[m.sender];
        }
    }
};

function parseInfo(infoStr = '') {
    const lines = infoStr.split('\n').map(v => v.trim()).filter(Boolean);
    const [line1, line2] = lines;
    let dur = '', qual = '', views = '';

    if (line1) {
        const durMatch = line1.match(/(\d+\s?min)/i);
        dur = durMatch ? durMatch[1] : '';
    }
    if (line2) {
        const parts = line2.split('-').map(v => v.trim()).filter(Boolean);
        if (parts.length >= 2) {
            qual = parts[0];
            views = parts[1];
        } else if (parts.length === 1) {
            qual = parts[0];
        }
    }
    return { dur, qual, views };
}

async function xnxxdl(URL) {
    return new Promise((resolve, reject) => {
        fetch(URL).then(res => res.text()).then(res => {
            const $ = cheerio.load(res);
            const title = $('meta[property="og:title"]').attr('content');
            const videoScript = $('#video-player-bg > script:nth-child(6)').html();
            const files = {
                low: (videoScript.match('html5player.setVideoUrlLow\\(\'(.*?)\'\\);') || [])[1],
                high: videoScript.match('html5player.setVideoUrlHigh\\(\'(.*?)\'\\);')[1]
            };
            const info = parseInfo($('span.metadata').text());
            resolve({ status: 200, result: { title, URL, info, files } });
        }).catch(err => reject(err));
    });
}

async function search(query) {
    return new Promise((resolve, reject) => {
        const baseurl = 'https://www.xnxx.com';
        fetch(`${baseurl}/search/${query}/1`).then(res => res.text()).then(res => {
            const $ = cheerio.load(res);
            const results = [];
            $('div.mozaique').each((a, b) => {
                $(b).find('div.thumb-under').each((c, d) => {
                    const title = $(d).find('a').attr('title');
                    const link = baseurl + $(d).find('a').attr('href').replace('/THUMBNUM/', '/');
                    const info = $(d).find('p.metadata').text();
                    results.push({ title, link, info });
                });
            });
            resolve({ code: 200, status: true, result: results });
        }).catch(err => reject(err));
    });
}

// ✅ Export listo para cmd.run
module.exports = {
    run: handler,
    before: handler.before,
    command: ['xnxxsearch', 'xnxxdl', 'xnxx'],
    tags: ['download'],
    help: ['xnxx'],
    group: false
};
