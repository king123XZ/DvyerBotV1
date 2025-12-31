module.exports = async (client, update) => {
  try {
    const { id, participants, action } = update

    for (let user of participants) {

      // CUANDO ENTRA
      if (action === 'add') {
        await client.sendMessage(id, {
          text: `👋 Bienvenido @${user.split('@')[0]} al grupo`,
          mentions: [user]
        })
      }

      // CUANDO SALE
      if (action === 'remove') {
        await client.sendMessage(id, {
          text: `👋 @${user.split('@')[0]} salió del grupo`,
          mentions: [user]
        })
      }

    }
  } catch (err) {
    console.log('Error bienvenida:', err)
  }
}
