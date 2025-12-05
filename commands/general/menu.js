module.exports = {
  name: "menu",
  alias: ["help", "ayuda"],
  run: async (client, m, { prefix }) => {

    const menu = `
⧼ 𝐘𝐞𝐫𝐓𝐗 𝐁𝐎𝐓 - 𝐌𝐄𝐍𝐔 𝐇𝐀𝐂𝐊𝐄𝐑 ⧽
──────────────────────────────

👤 *Usuario:* ${m.pushName}
🏴 *Modo:* Hacker Oscuro
🕶️ *Versión:* 2.0

⛧ 𝗗𝗘𝗦𝗖𝗔𝗥𝗚𝗔𝗦
❯ ${prefix}ytmp3
❯ ${prefix}ytmp4
❯ ${prefix}play
❯ ${prefix}tiktok
❯ ${prefix}facebook

⛧ 𝗨𝗧𝗜𝗟𝗜𝗗𝗔𝗗𝗘𝗦
❯ ${prefix}sticker
❯ ${prefix}toimg
❯ ${prefix}hd
❯ ${prefix}qr

⛧ 𝗜𝗡𝗙𝗢𝗕𝗢𝗧
❯ ${prefix}ping
❯ ${prefix}owner
❯ ${prefix}runtime
❯ ${prefix}estado

──────────────────────────────
⚠ 𝙐𝙨𝙤 𝙗𝙖𝙟𝙤 𝙧𝙚𝙨𝙥𝙤𝙣𝙨𝙖𝙗𝙞𝙡𝙞𝙙𝙖𝙙.
`;

    await client.sendMessage(m.chat, {
      image: { url: "https://i.ibb.co/XxdTkYNq/menu.png" },
      caption: menu
    });
  }
};


