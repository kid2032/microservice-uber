const express= require("express")
const user = require("../controller/user")
const AuthMiddleware = require("../middleware/authmiddleware")
const router= express.Router()


router.post("/register",user.Register)
router.post("/login",user.Login)

router.post("/logout",AuthMiddleware,user.Logout)

router.get("/profile",AuthMiddleware,user.Profile)

router.get("/check-auth",AuthMiddleware,user.CheckAuthorization)

router.post('/update', user.updateLocation);
router.post('/route', user.getRoute);

module.exports=router



