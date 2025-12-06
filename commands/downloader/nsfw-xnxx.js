const fetch = require('node-fetch');
const axios = require('axios');
const cheerio = require('cheerio');

const handler = async (m, { text, conn, args, usedPrefix }) => {
    // Inicializar conn.xvideos para evitar errores
    conn.xvideos = conn.xvideos || {};

    if (!text) return m.reply('❀ Por favor, ingresa el título o URL del video de *(xvideos)*.');

    const isUrl = text.includes('xvideos.com');

    if (isUrl) {
        try {
            await m.react('🕒');
            const res = await xvideosdl(args[0]);
            const { duration, likes, deslikes, views } = res.result;
            const txt = `*乂 ¡XVIDEOS - DOWNLOAD! 乂*\n\n≡ Título : ${res.result.title}\n≡ Duración : ${duration || 'Desconocida'}\n≡ Likes : ${likes || 'Desconocida'}\n≡ Des-Likes : ${deslikes || 'Desconocidos'}\n≡ Vistas : ${views || 'Desconocidas'}`;
            const dll = res.result.url;
            await conn.sendFile(m.chat, dll, res.result.title + '.mp4', txt, m);
            await m.react('✔️');
        } catch (e) {
            await m.react('✖️');
            await conn.reply(m.chat, `⚠︎ Error al descargar el video.\n> Usa *${usedPrefix}report* para informarlo.\n\n` + e, m);
        }
        return;
    }

    const res = await search(text);
    await m.react('🕒');
    if (!res.length) return m.reply('ꕥ No se encontraron resultados.');
    await m.react('✔️');

    const list = res.slice(0, 10).map((v, i) => `*${i + 1}*\n≡ Título : *${v.title}*\n≡ Link : ${v.url}`).join('\n\n');
    const caption = `*乂 ¡XVIDEOS - SEARCH! 乂*\n\n${list}\n\n> » Responde con el número + n para descargar uno de los vídeos o usa la URL directamente.`;

    const { key } = await conn.sendMessage(m.chat, { text: caption }, { quoted: m });
    conn.xvideos[m.sender] = {
        result: res,
        key,
        downloads: 0,
        timeout: setTimeout(() => delete conn.xvideos[m.sender], 120_000)
    };
};

handler.before = async (m, { conn }) => {
    conn.xvideos = conn.xvideos || {};
    const session = conn.xvideos[m.sender];
    if (!session || !m.quoted || m.quoted.id !== session.key.id) return;

    const n = parseInt(m.text.trim());
    if (isNaN(n) || n < 1 || n > session.result.length) {
        await m.reply('ꕥ Por favor, ingresa un número válido.');
        return;
    }

    try {
        await m.react('🕒');
        const link = session.result[n - 1].url;
        const res = await xvideosdl(link);
        const { duration, likes, deslikes, views } = res.result;
        const txt = `*乂 ¡XVIDEOS - DOWNLOAD! 乂*\n\n≡ Título : ${res.result.title}\n≡ Duración : ${duration || 'Desconocida'}\n≡ Likes : ${likes || 'Desconocida'}\n≡ Des-Likes : ${deslikes || 'Desconocidos'}\n≡ Vistas : ${views || 'Desconocidas'}`;
        const dll = res.result.url;
        await conn.sendFile(m.chat, dll, res.result.title + '.mp4', txt, m);
        await m.react('✔️');
    } catch (e) {
        await m.react('✖️');
        await conn.reply(m.chat, `⚠︎ Error al descargar el video.\n> Usa *${usedPrefix}report* para informarlo.\n\n` + e, m);
    } finally {
        session.downloads++;
        if (session.downloads >= 5) {
            clearTimeout(session.timeout);
            delete conn.xvideos[m.sender];
        }
    }
};

async function search(query) {
    try {
        const url = `https://www.xvideos.com/?k=${encodeURIComponent(query)}`;
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const results = [];
        $("div.mozaique > div").each((index, element) => {
            const title = $(element).find("p.title a").attr("title");
            const videoUrl = "https://www.xvideos.com" + $(element).find("p.title a").attr("href");
            results.push({ title, url: videoUrl });
        });
        return results;
    } catch (e) {
        return [];
    }
}

async function xvideosdl(url) {
    try {
        const res = await fetch(url);
        const body = await res.text();
        const $ = cheerio.load(body);
        const title = $("meta[property='og:title']").attr("content");
        const duration = (() => {
            const s = parseInt($('meta[property="og:duration"]').attr('content'), 10) || 0;
            return s >= 3600 ? `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m ${s % 60}s`
                : s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s`
                : `${s}s`;
        })();
        const likes = $("span.rating-good-nbr").text();
        const deslikes = $("span.rating-bad-nbr").text();
        const views = $("div#video-tabs > div > div > div > div > strong.mobile-hide").text() + " views";
        const videoUrl = $("#html5video > #html5video_base > div > a").attr("href");
        return { status: 200, result: { title, duration, url: videoUrl, likes, deslikes, views } };
    } catch (e) {
        throw e;
    }
}

// ✅ Export listo para cmd.run y universal
module.exports = {
    run: handler,
    before: handler.before,
    command: ['xvideos', 'xvsearch', 'xvideosdl', 'xvid'],
    tags: ['download'],
    help: ['xvideos'],
    group: false
};

