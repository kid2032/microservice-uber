const express= require("express")
const user = require("../controller/ride")
const {CaptainMiddleware,UserMiddleware} = require("../middleware/authmiddleware")
const router= express.Router()

router.post('/create-ride', UserMiddleware, user.CreateRide)
router.put('/accept-ride',CaptainMiddleware, user.AcceptRide)

module.exports=router



