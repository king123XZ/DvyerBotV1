const fetch = require("node-fetch");

const key = "dfcb6d76f2f6a9894gjkege8a4ab232222";
const agent = "Mozilla/5.0 (Android 13; Mobile; rv:146.0) Gecko/146.0 Firefox/146.0";
const referer = "https://y2down.cc/enSB/";

const video = ['144', '240', '360', '720', '1080', '1440', '4k'];
const audio = ['mp3', 'm4a', 'webm', 'aac', 'flac', 'apus', 'ogg', 'wav'];

async function ytdl(url, format) {
  if (!video.includes(format) && !audio.includes(format)) {
    return { error: "Formato no válido" };
  }

  try {
    const initUrl = `https://p.savenow.to/ajax/download.php?copyright=0&format=${format}&url=${encodeURIComponent(url)}&api=${key}`;

    const init = await fetch(initUrl, {
      headers: {
        "User-Agent": agent,
        "Referer": referer
      }
    });

    const data = await init.json();
    if (!data.success) return { error: "No se pudo iniciar la descarga" };

    const id = data.id;
    const progressUrl = `https://p.savenow.to/api/progress?id=${id}`;

    while (true) {
      await new Promise(r => setTimeout(r, 2000));

      const res = await fetch(progressUrl, {
        headers: {
          "User-Agent": agent,
          "Referer": referer
        }
      });

      const status = await res.json();

      if (status.progress === 1000) {
        return {
          title: data.title || "YT Download",
          link: status.download_url
        };
      }
    }
  } catch (e) {
    return { error: e.message };
  }
}

module.exports = { ytdl };
