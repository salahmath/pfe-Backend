const express=require('express');
const { creatblog, updateBlog, getBlog, getallblog, deleteBlog, likeblogs } = require('../controller/blogcontrol');
const { authMiddleware, isAdmin } = require('../middelware/authentificationmidell');
const { dislikeblogs } = require('../controller/blogcontrol');
const router = express.Router();

router.post("/blogcreat",authMiddleware,isAdmin,creatblog);
router.put("/updateblog/:id", authMiddleware, isAdmin,updateBlog)
router.put("/likeblog", likeblogs)
router.put("/dislikeblog", dislikeblogs)
router.get("/getblog/:id",getBlog)
router.delete("/deleteblog/:id", authMiddleware, isAdmin,deleteBlog)
router.get("/getallblog",getallblog)


module.exports = router; 