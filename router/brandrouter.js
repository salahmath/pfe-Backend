const express = require("express");

const { authMiddleware, isAdmin } = require("../middelware/authentificationmidell");
const { addbrand,  updatebrand, deletebrand, getbrand, getallbrand } = require("../controller/brandcontroller.js");
const router = express.Router();


router.post("/creebrand",authMiddleware,isAdmin,addbrand);
router.put("/updatebrand/:id",authMiddleware,isAdmin, updatebrand);
router.delete("/deletebrand/:id",authMiddleware,isAdmin,deletebrand);
router.get("/getbrand/:id",getbrand);
router.get("/getallbrand",getallbrand);

module.exports = router;