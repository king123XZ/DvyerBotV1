module.exports = {
    name: "menu",
    alias: ["help", "cmd", "comandos"],
    desc: "Menú con categorías expandibles",
    run: async (client, m, args) => {
        try {
            const menuImage = "https://i.ibb.co/XxdTkYNq/menu.png";

            const message = {
                image: { url: menuImage },
                caption: `
⛧━━━━━━🜸 *HACKER MENU* 🜸━━━━━━⛧

Selecciona una categoría para ver los comandos 👇
                `.trim(),
                footer: "SonGoku Bot • YerTX2",
                templateButtons: [
                    { index: 1, quickReplyButton: { displayText: "🔥 DESCARGAS", id: "cat_descargas" }},
                    { index: 2, quickReplyButton: { displayText: "🧰 UTILIDADES", id: "cat_utilidades" }},
                    { index: 3, quickReplyButton: { displayText: "🎭 DIVERSIÓN", id: "cat_diversion" }},
                    { index: 4, quickReplyButton: { displayText: "🛠 SISTEMA", id: "cat_sistema" }},
                ]
            };

            await client.sendMessage(m.chat, message, { quoted: m });

        } catch (e) {
            console.error(e);
            client.sendMessage(m.chat, { text: "❌ Error al mostrar el menú." }, { quoted: m });
        }
    }
};



