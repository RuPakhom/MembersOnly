require('dotenv').config({path: __dirname + '/../.env'})

const env = {
    pgHost: process.env.PGHOST,
    pgPort: process.env.PGPORT,
    pgDb: process.env.PGDATABASE,
    pgUser: process.env.PGUSER,

    secret: process.env.SECRET,

    membership: process.env.MEMBERSHIP_CODE,
    adminCode: process.env.ADMIN_CODE

}

module.exports = env