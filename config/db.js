const { Pool } = require("pg")
const env = require("./env")

const pool = new Pool({
    host: env.pgHost,
    database: env.pgDb,
    port: env.pgPort,
    user: env.pgUser
})

module.exports = pool