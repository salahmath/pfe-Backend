const express = require("express");

const { authMiddleware, isAdmin } = require("../middelware/authentificationmidell");
const { addColor, updatecolor, deleteColor, getColor, getallColor } = require("../controller/colorctrl");
const router = express.Router();


router.post("/creecolor",authMiddleware,isAdmin, addColor);
router.put("/updatecolor/:id",authMiddleware,isAdmin, updatecolor);
router.delete("/deletecolor/:id",authMiddleware,isAdmin,deleteColor);
router.get("/getcolor/:id",getColor);
router.get("/getallcolor",getallColor);

module.exports = router;