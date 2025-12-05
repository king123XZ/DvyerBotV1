module.exports = async (client, m) => {
    const id = m.message?.extendedTextMessage?.text || m.message?.buttonsResponseMessage?.selectedButtonId;

    if (!id) return;

    const send = (txt) => client.sendMessage(m.chat, { text: txt }, { quoted: m });

    switch (id) {

        case "cat_descargas":
            send(`
🔥 *CATEGORÍA: DESCARGAS*

⚡ !ytmp3 <link>
⚡ !ytmp4 <link>
⚡ !play <texto>
⚡ !tiktok <link>
⚡ !facebook <link>
            `);
            break;

        case "cat_utilidades":
            send(`
🧰 *CATEGORÍA: UTILIDADES*

⚡ !sticker
⚡ !toimg
⚡ !qr <texto>
⚡ !traducir <lang> <texto>
⚡ !reportar <texto>
            `);
            break;

        case "cat_diversion":
            send(`
🎭 *CATEGORÍA: DIVERSIÓN*

⚡ !gay @usuario
⚡ !hack <nombre>
⚡ !futuro
⚡ !ship @a @b
⚡ !meme
            `);
            break;

        case "cat_sistema":
            send(`
🛠 *CATEGORÍA: SISTEMA*

⚡ !ping
⚡ !estado
⚡ !runtime
⚡ !owner
            `);
            break;
    }
};
