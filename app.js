const express = require("express")
const env = require("./config/env")
const app = express()
const session = require("./config/session")
const passport = require("./config/passport") 

const indexRouter = require("./routes/indexRouter")

app.use(express.static("public"))
app.set("view engine", "ejs")
app.use(session)
app.use(passport.session())

app.use(express.urlencoded({ extended: true }))

app.use((req, res, next) => {
    res.locals.user = req.user
    next()
})

app.use("/", indexRouter)

app.get("/", (req, res) => {
    res.send("Hello World")
})

app.listen(3000, () => console.log("Working on port 3000"))