const axios = require("axios")

const api = axios.create({
  timeout: 20000,
  headers: {
    "User-Agent": "KilluaBot/1.0",
    "Content-Type": "application/json"
  }
})

module.exports = api
