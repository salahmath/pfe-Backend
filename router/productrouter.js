const express = require('express');
const {creatProduct, getAproduct, Getallproduct, Updateproduct, DeleteProduct} = require('../controller/Productcontroler');
const { isAdmin, authMiddleware } = require('../middelware/authentificationmidell');
const router = express.Router();

router.delete('/deleteaproduct/:id',authMiddleware,isAdmin,DeleteProduct);
router.post('/creeproduct',authMiddleware,isAdmin,creatProduct);
router.get('/getaproduct/:id',getAproduct);
router.put('/updateaproduct/:id',authMiddleware,isAdmin,Updateproduct);

router.get('/getallproduct',Getallproduct);



module.exports = router;