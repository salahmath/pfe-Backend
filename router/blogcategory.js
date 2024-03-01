const express = require("express");

const { authMiddleware, isAdmin } = require("../middelware/authentificationmidell");
const { addcategoryblog, updatecaategoryblog, deletecategoryblog, getcategoryblog, getallcategoryblog } = require("../controller/blogcategoryblog");
const router = express.Router();


router.post("/creecategory",authMiddleware,isAdmin,addcategoryblog);
router.put("/updatecategory/:id",updatecaategoryblog);
router.delete("/deletecategory/:id",deletecategoryblog);
router.get("/getcategory/:id",getcategoryblog);
router.get("/getallcategory",getallcategoryblog);

module.exports = router;