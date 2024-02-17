const express= require("express");
const { authMiddleware, isAdmin } = require("../middelware/authentificationmidell");
const { creecoupon, deletecoupon, getcoupon, getallcoupon, updatecoupon } = require("../controller/couponcontroller");
const router = express.Router();

router.post("/ajoutcoupon",authMiddleware,isAdmin,creecoupon);
router.delete("/delcoupon/:id",authMiddleware,isAdmin,deletecoupon);
router.get("/getcoupon/:id",authMiddleware,isAdmin,getcoupon);
router.get("/getallcoupon",authMiddleware,isAdmin,getallcoupon);
router.put("/updatecoupon/:id",authMiddleware,isAdmin,updatecoupon);



module.exports= router;