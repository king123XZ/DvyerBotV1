const axios = require("axios");

module.exports = {
    name: "tiktok",
    alias: ["tt"],
    run: async (client, m, args) => {
        try {
            if (!args[0]) return m.reply("📌 *Ingresa un enlace de TikTok.*");

            let url = args[0];

            // API rápida y gratuita
            let api = `https://api.tikmate.app/api/lookup?url=${encodeURIComponent(url)}`;
            let res = await axios.get(api);

            if (!res.data || !res.data.video_url) {
                return m.reply("❌ No pude obtener el video.");
            }

            let videoUrl = "https://tikmate.app/download/" + res.data.token + "/" + res.data.id + ".mp4";

            // Enviar video sin botones
            await client.sendMessage(m.chat, {
                video: { url: videoUrl },
                caption: "✔ Video descargado"
            });

        } catch (err) {
            console.log("Error tiktok:", err);
            return m.reply("❌ Error descargando el video.");
        }
    }
};

