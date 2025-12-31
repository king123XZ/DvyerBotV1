module.exports = {
  command: ["peliculas"],
  category: "media",

  run: async (client, m) => {
    try {
      await client.sendMessage(
        m.chat,
        {
          image: {
            url: "https://i.ibb.co/r2HCv5s9/killu-peliculas.png"
          },
          caption:
            "🎬 *MENÚ DE PELÍCULAS*\n\n" +
            "Selecciona una opción 👇\n\n" +
            "🔐 Contraseña: www.blizzboygames.net\n" +
            "👑 DevYer",
          buttons: [
            {
              buttonId: ".pelicula 1",
              buttonText: { displayText: "🎬 Dragon Ball Broly" },
              type: 1
            },
            {
              buttonId: ".pelicula 2",
              buttonText: { displayText: "🔥 Kimetsu Mugen Train" },
              type: 1
            },
            {
              buttonId: ".pelicula 3",
              buttonText: { displayText: "🦖 Godzilla 2" },
              type: 1
            },
            {
              buttonId: ".peliculas2",
              buttonText: { displayText: "➡️ Más películas" },
              type: 1
            }
          ],
          headerType: 4
        },
        { quoted: m }
      );
    } catch (e) {
      console.error("ERROR MENU PELICULAS:", e);
      m.reply("❌ No se pudo mostrar el menú.");
    }
  }
};
