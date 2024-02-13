const express = require("express");

const { authMiddleware, isAdmin } = require("../middelware/authentificationmidell");
const { addbrand,  updatebrand, deletebrand, getbrand, getallbrand } = require("../controller/brandcontroller.js");
const router = express.Router();


router.post("/creebrand",addbrand);
router.put("/updatebrand/:id", updatebrand);
router.delete("/deletebrand/:id",deletebrand);
router.get("/getbrand/:id",getbrand);
router.get("/getallbrand",getallbrand);

module.exports = router;