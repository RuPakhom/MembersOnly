const passport = require('passport')
const LocalStrategy = require("passport-local").Strategy
const bcrypt = require("bcryptjs")
const db = require("../db/queries")

passport.use(
    new LocalStrategy({ usernameField: 'username' }, async (username, password, done) => {
        try {
            const rows = await db.getUserByUsername(username)
            const user = rows[0]


            if (!user) return done(null, false, { message: "Invalid Username" })
            
            const match = await bcrypt.compare(password, user.password)
            if (!match) return done(null, false, { message: "Invalid password" })
        
            return done(null, user)
        }
        catch (err) {
            console.log(err)
            return done(err)
    }
    })
)

passport.serializeUser((user, done) => { done(null, user.id) })
passport.deserializeUser(async (id, done) => {
    try {
        const rows = await db.getUserById(id)
        const user = rows[0]

        return done(null, user)
    }
    catch (err) {
        return done(err)
    }
})

module.exports = passport