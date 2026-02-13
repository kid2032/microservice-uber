const express= require("express")
const Captain= require("../controller/captain")
const AuthMiddleware = require("../middleware/authmiddleware")
const router= express.Router()


router.post("/register",Captain.Register)
router.post("/login",Captain.Login)

router.post("/logout",AuthMiddleware,Captain.Logout)

router.get("/profile",AuthMiddleware,Captain.Profile)

module.exports=router



