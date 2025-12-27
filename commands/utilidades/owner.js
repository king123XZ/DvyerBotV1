module.exports = {
  command: ["owner", "dueño", "dueno"],

  run: async (client, m) => {
    try {
      const ownerNumber = "51907376960";
      const ownerName = "devyer";

      await client.sendMessage(
        m.chat,
        {
          contacts: {
            displayName: ownerName,
            contacts: [
              {
                vcard:
`BEGIN:VCARD
VERSION:3.0
FN:${ownerName}
TEL;type=CELL;type=VOICE;waid=${ownerNumber}:${ownerNumber}
END:VCARD`
              }
            ]
          }
        },
        { quoted: m }
      );

    } catch (e) {
      console.error("OWNER ERROR:", e);
      m.reply("❌ No se pudo enviar el contacto del dueño.");
    }
  }
};
