module.exports = {
  command: ["peliculas"],
  category: "general",

  run: async (client, m) => {
    const buttons = [
      {
        buttonId: ".verpeliculas",
        buttonText: { displayText: "🎬 Películas" },
        type: 1
      },
      {
        buttonId: ".credito",
        buttonText: { displayText: "💳 Ver Créditos" },
        type: 1
      },
      {
        buttonId: ".comprarcredito",
        buttonText: { displayText: "🛒 Comprar Créditos" },
        type: 1
      }
    ];

    await client.sendMessage(
      m.chat,
      {
        image: {
          url: "https://i.ibb.co/r2HCv5s9/killu-peliculas.png"
        },
        caption:
          "👋 *Bienvenido a Killua Bot*\n\n" +
          "🎬 Películas en alta calidad\n" +
          "⚡ Descargas directas\n" +
          "💳 Sistema de créditos\n\n" +
          "👇 *Selecciona una opción:*",
        footer: "Killua Bot • DevYer",
        buttons,
        headerType: 4
      },
      { quoted: m }
    );
  }
};
