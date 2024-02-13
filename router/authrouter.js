
const express = require("express");
const { Createuser, Updatepassword,Getuser,Getalluser,deleteauser,updateauser, getauser, handlrrefreshtoken, logout, forgotPassword, rsetpassword } = require("../controller/usercontrol");
const {authMiddleware, isAdmin, blockuser, unblockuser}= require("../middelware/authentificationmidell");




const router = express.Router();

router.put("/password",authMiddleware,Updatepassword);
router.post("/register",Createuser);
router.post("/login",Getuser);
router.put('/reset-password/:token',rsetpassword)
router.post("/forgot-password-token",forgotPassword);
router.get("/getalluser",Getalluser);
router.get("/logout",logout);
router.get("/refreshToken",handlrrefreshtoken);
router.get("/getauser/:id", authMiddleware, isAdmin, getauser);
router.delete("/deleteauser/:id",deleteauser);
router.put("/updateauser/:id",authMiddleware,updateauser);
router.put("/blockuser/:id",authMiddleware,isAdmin,blockuser);
router.put("/deblockuser/:id",authMiddleware,isAdmin,unblockuser);




module.exports = router;