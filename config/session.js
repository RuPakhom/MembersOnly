const env = require("./env")
const session = require('express-session')
const pgSession = require('connect-pg-simple')(session)

const pool = require('./db')

module.exports = session({
    store: new pgSession({
        pool,
        tableName: 'session'
    }),
    secret: env.secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000
    }
})