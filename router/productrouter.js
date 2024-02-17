const express = require('express');
const {creatProduct, getAproduct, Getallproduct, Updateproduct, DeleteProduct, addtowihlis, rating, uploadImages, deleteImages } = require('../controller/Productcontroler');
const { isAdmin, authMiddleware } = require('../middelware/authentificationmidell');
const { uploadphoto, productImgResize } = require('../middelware/uploadimage');
const router = express.Router();

router.delete('/deleteimg/:id',authMiddleware,isAdmin,deleteImages);
router.delete('/deleteaproduct/:id',authMiddleware,isAdmin,DeleteProduct);
router.post('/creeproduct',authMiddleware,isAdmin,creatProduct);
router.get('/getaproduct/:id',getAproduct);
router.put('/updateaproduct/:id',authMiddleware,isAdmin,Updateproduct);
router.get('/getallproduct',Getallproduct);
router.put('/getwishes',authMiddleware,addtowihlis);
router.put('/rate',authMiddleware,rating);

  router.put("/upload",authMiddleware,isAdmin,uploadphoto.array('images',10),productImgResize, uploadImages)

  
module.exports = router;