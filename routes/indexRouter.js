const { Router } = require("express")
const indexController = require("../controllers/indexController")

const indexRouter = new Router()

indexRouter.get("/", indexController.indexGet)

indexRouter.get("/signup", indexController.formGet)
indexRouter.post("/signup", indexController.signupPost)

indexRouter.get("/membership", indexController.membershipGet)
indexRouter.post("/membership", indexController.membershipPost)


indexRouter.get("/login", indexController.loginGet)
indexRouter.post("/login", indexController.loginPost)

indexRouter.get("/logout", indexController.logout)

indexRouter.get("/addmessage", indexController.addMessgeGet)
indexRouter.post("/addmessage", indexController.addMessgePost)

indexRouter.get("/messages/:id/delete", indexController.deleteMessage)


module.exports = indexRouter