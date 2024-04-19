const express = require("express");

const { authMiddleware, isAdmin } = require("../middelware/authentificationmidell");
const { addenq, updateenq, deleteenq, getenq, getallenq, reponse, getenqbyuser } = require("../controller/enqcontroller");
const router = express.Router();


router.post("/creeenq",authMiddleware, addenq);
router.put("/updateenq/:id",authMiddleware, isAdmin , updateenq);
router.delete("/deleteenq/:id",authMiddleware, isAdmin ,deleteenq);
router.get("/getenq/:id",authMiddleware,getenq);
router.get("/getallenq",getallenq);
router.put("/response/:id",authMiddleware,reponse);
router.get("/getenqbyuser",authMiddleware,getenqbyuser);

module.exports = router;