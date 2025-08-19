const { validationResult, body } = require("express-validator")
const db = require("../db/queries")
const hashPassword = require("../controllers/hash")
const env = require("../config/env")
const passport = require("../config/passport")

function getErrorMap(errArray) {
    const errorsMap = {}
    errArray.forEach(e => errorsMap[e.path] = e)
    return errorsMap
}

function formatDate(dateString) {
    const d = new Date(dateString)
    const pad = (n) => String(n).padStart(2, "0")

    const day = pad(d.getDate())
    const month = pad(d.getMonth() + 1)
    const year = d.getFullYear()

    const hours = pad(d.getHours())
    const minutes = pad(d.getMinutes())
    const seconds = pad(d.getSeconds())

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`
}

const signup_post = [
    body('firstname')
        .trim()
        .isLength({ min: 1, max: 50 }).withMessage('First Name must be 1-50 characters long')
        .bail()
        .matches(/^[\p{L}\p{M}\-'\s]+$/u).withMessage('First name has invalid characters'),
    body('lastname')
        .trim()
        .isLength({ min: 1, max: 50 }).withMessage('Last must be 1-50 characters long')
        .bail()
        .matches(/^[\p{L}\p{M}\-'\s]+$/u).withMessage('First name has invalid characters'),
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 }).withMessage('Nickname must be 3-30 characters long')
        .bail()
        .matches(/^[\p{L}\p{M}\-'\s]+$/u).withMessage('First name has invalid characters')
        .custom(async (username) => {
            const isUniqueUsername = await db.isUniqueUsername(username)
            if (!isUniqueUsername) {
                throw new Error('Username already in use')
            }
            return true
        }),
    body('password')
        .isStrongPassword({ minLength: 8 }).withMessage('Password must be at least 8 chars and include lowercase, uppercase, number and symbol'),
    body('confirm_password')
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) throw new Error('Passwords do not match')
            return true
        })
    
]

const login_post = [
    body('username')
        .trim()
        .notEmpty().withMessage("Username required"),
    body('password')
    .notEmpty().withMessage("Password required")
]

const message_post = [
    body('title')
        .trim()
        .notEmpty().withMessage("Title is required")
        .isLength({ max: 100 }).withMessage("Title too long")
        .escape(),
    
    body('message')
        .trim()
        .notEmpty().withMessage("Message can't be empty")
        .escape()
]

module.exports.indexGet = async (req, res) => {
    const rows = await db.getAllMessages()
    const messages = rows.map(m => { return {  ...m, created_at: formatDate(m.created_at) } })
    res.render("index", { title: "membersOnly", messages: messages})
}

module.exports.formGet = (req, res) => {
    if (req.user) {
        return res.redirect("/")
    }
    res.render("signup", {title: "Signup", body: req.body})
}

module.exports.signupPost = [...signup_post, async (req, res) => {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            const errArray = errors.array();
            const errorsMap = getErrorMap(errArray)

            return res.status(400).render('signup', {
                    title: "Signup",
                    body: req.body,
                    errors: errArray,
                    errorsMap
            })
        }
    try {
            const hashedPassowrd = await hashPassword(req.body.password)
            const { firstname, lastname, username } = req.body
            await db.addUserToDb(firstname, lastname, username, hashedPassowrd)
            res.redirect("/")
        }
        catch (err) {
            console.log(err)
        }
}]
    
module.exports.membershipGet = (req, res) => {
    if (!req.user) {
        return res.redirect("/login")
    }
    res.render("membership", {title: "Get membership"})
}

module.exports.membershipPost = (req, res) => {
    if (req.body.membership === env.membership) {
        db.addMembershipToUser(req.user.id)
        res.redirect("/")
    } else if (req.body.membership === env.adminCode) {
        db.addAdminToUser(req.user.id)
        res.redirect("/")

    } else {
        res.render("membership", { title: "Get membership", error: "Incorrect secret code"})
    }
}

module.exports.loginGet = (req, res) => {
    if (req.user) {
        return res.redirect("/")
    }
    const messages = req.session.messages || [];
    delete req.session.messages
    console.log(messages)
    res.render("login", { title: "Login Page", body: req.body, messages: messages })
}

module.exports.loginPost = [...login_post, (req, res, next) => {
    const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const errArray = errors.array();
            const errorsMap = getErrorMap(errArray)

            return res.status(400).render('login', {
                    title: "Login Page",
                    body: req.body,
                    errors: errArray,
                    errorsMap
            })
        }
    return next()

    
}, passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login",
        failureMessage: true,
})
]

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err)
        }
    })
    res.redirect("/")
}

module.exports.addMessgeGet = (req, res) => {
    if (!req.user) {
        return res.redirect("/login")
    }
    res.render("addmessage", { title: "Add new message", body: req.body})
}

module.exports.addMessgePost = [...message_post, async (req, res) => {
    const errors = validationResult(req)
    
    if (!errors.isEmpty()) {
        const errArray = errors.array();
        const errorsMap = getErrorMap(errArray)

        return res.status(400).render('addmessage', {
                title: "message",
                body: req.body,
                errors: errArray,
                errorsMap
            })
        }
    try {
        const { title, message } = req.body
        const createdBy = req.user.id
        const createdAt = new Date()
        await db.addMessageToDb(title, message, createdAt, createdBy)
            res.redirect("/")
        }
        catch (err) {
            console.log(err)
        }
}]

module.exports.deleteMessage = async (req, res) => {
    try {
        if (!req.user?.is_admin) {
         return res.status(403).send("You are not authorized to do this")  
        }
        await db.deleteMessage(req.params.id)
        res.redirect("/") 
    }
    catch (err) {
        console.error(err)
    }

}
