const axios = require("axios");

module.exports = {
  command: ["menu", "help", "ayuda"],

  run: async (client, m) => {

    // 📥 Descargar audio desde GitHub RAW
    const audio = await axios.get(
      "https://raw.githubusercontent.com/DevYerZx/killua-bot-dev/main/audio/do_u_see_what_happens_when_u_break_your_promises_killua_zoldyck_hxh_h.mp3",
      { responseType: "arraybuffer" }
    );

    // 🎧 Enviar como nota de voz
    await client.sendMessage(m.chat, {
      audio: audio.data,
      mimetype: "audio/mpeg",
      ptt: true
    });

    await new Promise(r => setTimeout(r, 800));

    // 📹 VIDEO GIF
    await client.sendMessage(m.chat, {
      video: { url: "https://files.catbox.moe/2jmexf.mp4" },
      gifPlayback: true,
      caption: `⧼KILLUA DV V1.00⧽

👤 Usuario: ${m.pushName}
👑 *CREADOR: DVYER*`
    });
  }
};
