const express = require("express");
const {
  Createuser,
  Updatepassword,
  Getuser,
  Getalluser,
  deleteauser,
  updateauser,
  getauser,
  handlrrefreshtoken,
  logout,
  forgotPassword,
  rsetpassword,
  Getadmin,
  getwishlist,
  creeadres,
  UserCart,
  getusercart,
  applycoupon,
  deletAcart,
  updateCart,
  createorder,
  chekout,
  Verifypaiment,
  getOrder,
  getmonth,
  getmonthcount,
  getAllOrder,
  getorderbyuser,
  updateOrderStatus,
  deleteProductFromPanier,
} = require("../controller/usercontrol");
const {
  authMiddleware,
  isAdmin,
  blockuser,
  unblockuser,
} = require("../middelware/authentificationmidell");

const router = express.Router();

router.put("/password", authMiddleware, Updatepassword);
router.post("/register", Createuser);
router.post("/login", Getuser);
router.put("/reset-password/:token", rsetpassword);
router.post("/forgot-password-token", forgotPassword);
router.get("/getalluser", Getalluser);
router.get("/logout", logout);
router.post("/loginadmin", Getadmin);
router.get("/getwishlist", authMiddleware, getwishlist);
router.get("/refreshToken", handlrrefreshtoken);
router.get("/getauser", authMiddleware, getauser);
router.delete("/deleteauser/:id", deleteauser);
router.put("/updateauser", authMiddleware, updateauser);
router.put("/creeadress", authMiddleware, creeadres);
router.put("/blockuser/:id", authMiddleware, isAdmin, blockuser);
router.put("/deblockuser/:id", authMiddleware, isAdmin, unblockuser);
router.post("/cart/applycoupon", authMiddleware, applycoupon);
router.post("/creecart", authMiddleware, UserCart);
router.get("/getusercart", authMiddleware, getusercart);
router.get("/getmonth", authMiddleware, getmonth);
router.get("/getmonthcount", authMiddleware, getmonthcount);

router.delete(
  "/deleteProductFromPanier",
  authMiddleware,
  deleteProductFromPanier
);
router.delete("/deleteAcart/:Cart_id", authMiddleware, deletAcart);
router.put("/updateCart/:Cart_id/:newquantite", authMiddleware, updateCart);
/* router.post("/cart/createorder",authMiddleware,createOrder);
router.get("/getOrder",authMiddleware,getOrder)
router.get("/getallOrder",authMiddleware,isAdmin, getallOrder)
 */
router.put("/updateorder/:id", authMiddleware, isAdmin, updateOrderStatus);

router.get("/getorderbyuser/:id", authMiddleware, isAdmin, getorderbyuser);
router.post("/cart/createorder", authMiddleware, createorder);
router.post("/paymentsuccess", authMiddleware, chekout);
router.post("/paymentverif/:id", authMiddleware, Verifypaiment);
router.get("/getorder", authMiddleware, getOrder);
router.get("/getallorder", authMiddleware, getAllOrder);

module.exports = router;
