const express = require("express");

const { authMiddleware, isAdmin } = require("../middelware/authentificationmidell");
const { addenq, updateenq, deleteenq, getenq, getallenq } = require("../controller/enqcontroller");
const router = express.Router();


router.post("/creeenq",authMiddleware, isAdmin , addenq);
router.put("/updateenq/:id",authMiddleware, isAdmin , updateenq);
router.delete("/deleteenq/:id",authMiddleware, isAdmin ,deleteenq);
router.get("/getenq/:id",getenq);
router.get("/getallenq",getallenq);

module.exports = router;