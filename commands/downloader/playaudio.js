const axios = require('axios');

const pending = {}; // para trabajos pendientes de audio/documento

module.exports = {
  command: ["play"],
  description: "Busca y descarga audio usando Neoxr API",
  run: async (client, m, args) => {
    const chatId = m.key.remoteJid;
    const query = args.join(" ");
    const pref = global.prefixes?.[0] || ".";

    if (!query) {
      return client.sendMessage(chatId, {
        text: `⚠️ Uso:\n${pref}play <nombre de la canción>\nEj: ${pref}play Komang`
      }, { quoted: m });
    }

    await client.sendMessage(chatId, { react: { text: "⏳", key: m.key } });

    try {
      const res = await axios.get("https://api.neoxr.eu/api/play", {
        params: { q: query, apikey: "zMqDtV" },
        timeout: 60000
      });

      const data = res.data?.data;
      if (!res.data?.status || !data || !data.url) throw new Error("No se encontró la canción.");

      const { title, artist, url: audioUrl, thumbnail, duration } = data;

      const caption =
        `🎵 𝙎𝙤𝙣𝙜 𝙁𝙤𝙪𝙣𝙙\n` +
        `✦ Título: ${title}\n` +
        `✦ Artista: ${artist}\n` +
        `✦ Duración: ${duration || "Desconocida"}\n\n` +
        `Reacciona 👍 para Audio, ❤️ para Documento`;

      const preview = await client.sendMessage(chatId, {
        image: { url: thumbnail },
        caption
      }, { quoted: m });

      pending[preview.key.id] = { chatId, audioUrl, title, quoted: m };

      if (!client._playListener) {
        client._playListener = true;
        client.ev.on("messages.upsert", async ev => {
          for (const mm of ev.messages) {
            try {
              // Reacciones
              if (mm.message?.reactionMessage) {
                const { key: reactKey, text: emoji } = mm.message.reactionMessage;
                const job = pending[reactKey.id];
                if (job) {
                  const asDoc = emoji === "❤️";
                  await sendAudio(client, job, asDoc, mm);
                  delete pending[reactKey.id];
                }
              }

              // Respuestas citadas
              const ctx = mm.message?.extendedTextMessage?.contextInfo;
              const replyTo = ctx?.stanzaId;
              const texto = (mm.message?.conversation || "").trim().toLowerCase();
              if (replyTo && pending[replyTo]) {
                const job = pending[replyTo];
                if (texto === "1" || texto === "audio") {
                  await sendAudio(client, job, false, mm);
                  delete pending[replyTo];
                } else if (texto === "2" || texto === "doc") {
                  await sendAudio(client, job, true, mm);
                  delete pending[replyTo];
                } else {
                  await client.sendMessage(job.chatId, {
                    text: "⚠️ Responde con *1* (Audio) o *2* (Documento), o reacciona 👍 / ❤️."
                  }, { quoted: job.quoted });
                }
              }
            } catch (e) { console.error(e); }
          }
        });
      }

      await client.sendMessage(chatId, { react: { text: "✅", key: m.key } });

    } catch (err) {
      console.error("❌ Error al usar Neoxr API:", err);
      await client.sendMessage(chatId, { text: `❌ Error: ${err.message}` }, { quoted: m });
      await client.sendMessage(chatId, { react: { text: "❌", key: m.key } });
    }
  }
};

async function sendAudio(client, job, asDoc, mm) {
  const { chatId, audioUrl, title, quoted } = job;

  try {
    const audioRes = await axios.get(audioUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(audioRes.data);

    await client.sendMessage(chatId, {
      [asDoc ? "document" : "audio"]: buffer,
      mimetype: "audio/mpeg",
      fileName: `${title}.mp3`
    }, { quoted });

    await client.sendMessage(chatId, { react: { text: "✅", key: mm.key } });
  } catch (e) {
    console.error("Error enviando audio:", e);
    await client.sendMessage(chatId, { text: `❌ Error al enviar el audio: ${e.message}` }, { quoted });
  }
}

