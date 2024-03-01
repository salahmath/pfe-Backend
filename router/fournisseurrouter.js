const express= require("express");
const { addfournisseur, updatefournisseur, getfournisseur,getallfournisseur, deletefournisseur } = require("../controller/fournisseurcontroller");
const { authMiddleware, isAdmin } = require("../middelware/authentificationmidell");
const { creecoupon } = require("../controller/couponcontroller");
const router = express.Router();


router.post("/addfournisseur",authMiddleware,isAdmin,addfournisseur)
router.put("/updatefournisseur/:id",authMiddleware,isAdmin, updatefournisseur)
router.get("/getfournisseur/:id",authMiddleware,isAdmin,getfournisseur)
router.get("/getallfournisseur",getallfournisseur)
router.delete("/deletefournisseur/:id",authMiddleware,isAdmin,deletefournisseur)


module.exports= router;