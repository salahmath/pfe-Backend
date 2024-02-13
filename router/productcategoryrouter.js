const express = require("express");
const { addcategory, updatecaategory, deletecategory, getcategory ,getallcategory} = require("../controller/productcategorycontroller");
const { authMiddleware, isAdmin } = require("../middelware/authentificationmidell");
const router = express.Router();


router.post("/creecategory",authMiddleware,isAdmin,addcategory);
router.put("/updatecategory/:id",authMiddleware,isAdmin,updatecaategory);
router.delete("/deletecategory/:id",authMiddleware,isAdmin,deletecategory);
router.get("/getcategory/:id",authMiddleware,isAdmin,getcategory);
router.get("/getallcategory",authMiddleware,isAdmin,getallcategory);

module.exports = router;