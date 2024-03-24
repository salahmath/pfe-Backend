const { generatetoken } = require("../config/jwtconfig");
const user = require("../models/usermodel");
const Product = require("../models/Productmodel");
const Cart = require("../models/cart");
const asynchandeler = require("express-async-handler");
const validation = require("../utils/validationMongodb");
const { Refreshtoken } = require("../config/tokenrefresh");
const jwt = require("jsonwebtoken");
const sendEmail = require("../controller/emailcontrol");
const crypto = require("crypto");
const Coupon = require("../models/couponmodel");
const { trusted } = require("mongoose");
const uniqid = require('uniqid')
const Order = require("../models/ordermodel")
//cree un utilisateur
const Createuser = asynchandeler(async (req, res) => {
  const email = req.body.email;
  const finduser = await user.findOne({ email: email });
  if (!finduser) {
    const CreateUser = await user.create(req.body);
    res.json(CreateUser);
  } else {
    throw new Error("utilisateur deja ajouter ");
  }
});

//verifier l'existant d'un utilisateur:login
const Getuser = asynchandeler(async (req, res) => {
  const { email, password } = req.body;
  const finduser = await user.findOne({ email });
  if (finduser && (await finduser.isPasswordMatched(password))) {
    const refreshtoken = await Refreshtoken(finduser?._id);
    const updateuser = await user.findByIdAndUpdate(
      finduser.id,
      {
        refrechToken: refreshtoken,
      },
      {
        new: true,
      }
    );
    res.cookie("refrechToken", refreshtoken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: finduser?._id,
      email: finduser?.email,
      mobile: finduser?.mobile,
      lastname: finduser?.lastname,
      Secondname: finduser?.Secondname,
      token: generatetoken(finduser?._id),
    });
  } else {
    throw new Error("le utilisateur ne pas inscrit ");
  }
});
// login admni

const Getadmin = asynchandeler(async (req, res) => {
  const { email, password } = req.body;
  const findAdmin = await user.findOne({ email });
  if (findAdmin.role !== "admin")
    throw new Error("ne pas authoriser seulment pour les admins");
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    const refreshtoken = await Refreshtoken(findAdmin?._id);
    const updateuser = await user.findByIdAndUpdate(
      findAdmin.id,
      {
        refrechToken: refreshtoken,
      },
      {
        new: true,
      }
    );
    res.cookie("refrechToken", refreshtoken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findAdmin?._id,
      email: findAdmin?.email,
      mobile: findAdmin?.mobile,
      lastname: findAdmin?.lastname,
      Secondname: findAdmin?.Secondname,
      token: generatetoken(findAdmin?._id),
    });
  } else {
    throw new Error("le utilisateur ne pas inscrit ");
  }
});
//chercher tout les utilisateur
const Getalluser = asynchandeler(async (req, res) => {
  const allUsers = await user.find();

  if (allUsers) {
    res.json(allUsers);
  } else {
    throw new Error("Aucun utilisateur enregistré");
  }
});

//cherer un utilsateur
const getauser = asynchandeler(async (req, res) => {
  const { id } = req.params;
  validation(id); // Accès à la propriété 'id' de req.params
  const aUser = await user.findById(id);
  try {
    res.json({ aUser });
  } catch {
    throw new Error("Aucun utilisateur trouvé avec cet ID");
  }
});

//effacer un utilisateur
const deleteauser = asynchandeler(async (req, res) => {
  const { id } = req.params;
  const delUser = await user.findByIdAndDelete(id);
  validation(id);

  try {
    res.json({ msg: "utilisateur effacer" });
  } catch {
    throw new Error("Aucun utilisateur trouvé avec cet ID");
  }
});

//mise a jour un utilisateur
const updateauser = asynchandeler(async (req, res) => {
  const { id } = req.params;
  validation(id);
  const updateUser = await user.findByIdAndUpdate(
    id,
    {
      email: req?.body?.email,
      mobile: req?.body?.mobile,
      lastname: req?.body?.lastname,
      Secondname: req?.body?.Secondname,
    },
    {
      new: true,
    }
  );
  try {
    res.json(updateUser);
  } catch {
    throw new Error("Aucun utilisateur trouvé avec cet ID");
  }
});

// refrech token
const handlrrefreshtoken = asynchandeler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refrechToken) throw new Error("no refresh token is cookis");
  const refrechToken = cookie.refrechToken;
  console.log(refrechToken);
  const auser = await user.findOne({ refrechToken });
  if (!auser) throw new Error("no refresh token present in db or no matched");
  jwt.verify(refrechToken, process.env.JWT, (err, decoded) => {
    if (err || auser.id !== decoded.id) {
      throw new Error("there is somthing wrong with refresh token");
    }
    const accesstoken = generatetoken(auser?._id);
    res.json({ accesstoken });
  });
});
// logout
const logout = asynchandeler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refrechToken) throw new Error("no refresh token is here");

  const refrechToken = cookie.refrechToken;
  const auser = await user.findOne({ refrechToken });

  if (!auser) {
    res.clearCookie("refrechToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204);
  }

  await user.findOneAndUpdate(
    { refrechToken },
    {
      refrechToken: "",
    }
  );

  res.clearCookie("refrechToken", {
    httpOnly: true,
    secure: true,
  });

  res.sendStatus(204);
});
//changer password
const Updatepassword = asynchandeler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validation(_id);
  const auser = await user.findById(_id);
  if (password) {
    auser.password = password;
    const updatePassword = await auser.save();
    res.json(updatePassword);
  } else {
    res.json(auser);
  }
});
//forgot password
const forgotPassword = asynchandeler(async (req, res) => {
  const { email } = req.body;
  const auser = await user.findOne({ email });
  if (!auser) {
    throw new Error("Utilisateur non trouvé.");
  }
  try {
    // Générer un jeton de réinitialisation de mot de passe
    const token = await auser.createPasswordResetToken();
    await auser.save();
    // Construire l'URL de réinitialisation de mot de passe avec le jeton
    const resetUrl = `follow this link <a href="http://localhost:5000/api/user/reset-password/${token}">link<a/>`;
    // Données de l'email
    const data = {
      to: email,
      text: "hey",
      subject: "Lien pour réinitialiser le mot de passe",
      htm: resetUrl,
    };
    sendEmail(data);
    res.json(token);
  } catch (error) {
    // Gestion des erreurs
    throw new Error(error);
  }
});
//reset le mot de passe
const rsetpassword = asynchandeler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const auser = await user.findOne({
    passwordResetToken: hashedToken,
    passwordRessetExpires: { $gt: Date.now() },
  });
  if (!auser) throw new Error("token expired");
  auser.password = password;
  auser.passwordResetToken = undefined;
  auser.passwordRessetExpires = undefined;
  await auser.save();
  res.json(auser);
});

//get wishlist
const getwishlist = asynchandeler(async (req, res) => {
  const { id } = req.user;
  try {
    const find = await user.findById(id).populate("wishlist");
    res.json(find);
  } catch (error) {
    throw new Error(error);
  }
});


//ajouter adress ou modifier
const creeadres = asynchandeler(async (req, res) => {
  const { id } = req.user;
  try {
    const cree = await user.findByIdAndUpdate(
      id,
      { address: req?.body?.adress },
      { new: true }
    );
    res.json(cree);
  } catch (error) {
    throw new Error(error);
  }
});

const UserCart = asynchandeler(async (req, res) => {
  const { productId ,color ,quantite,price } = req.body;
  const { id } = req.user;
  validation(id);
  try {
    let newcart = await new Cart({
      UserId : id,
      color ,
      quantite,
      price,
      productId
    }).save();
    res.json(newcart);
  } catch (error) {
    throw new Error(error);
  }
});
// get  cart
const getusercart = asynchandeler(async (req, res) => {
  const { id } = req.user;
  try {
    const cart = await Cart.findOne({ orderby: id }).populate(
      "products.product"
    );
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});
//delete cart
const deletcart = asynchandeler(async (req, res) => {
  const { id } = req.user;
  try {
    const user = await Cart.findOne({ id });
    const cart = await Cart.findOneAndDelete({ orderby: id });
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});

const applycoupon =asynchandeler( async (req, res) => {
  const { coupon } = req.body;
  const { _id } = req.user;
  try {
    const ecoupon = await Coupon.findOne({ name: coupon });
    if (ecoupon === null) {
      throw new Error("This coupon is not valid");
    }
    const auser = await user.findOne({ _id }); // Corrected to await User.findOne({ _id })
    let { products, cartTotal } = await Cart.findOne({
      orderby : user._id,
    }).populate(
      "products.product");
    let totalAfterDiscount = (
      cartTotal - (cartTotal * ecoupon.discount) / 100
    ).toFixed(2);
    await Cart.findOneAndUpdate(
      {orderby: user._id}, 
      { totalAfterDiscount },
      { new: true } // Corrected to use { new: true }
    );
    res.json(totalAfterDiscount);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
)
const createOrder = async (req, res) => {
  const { COD, couponApplied } = req.body;
  const { id } = req.user;
  try {
    if (!COD) throw new Error("create cash order failed");
    
    const auser = await user.findById(id); // Utilisation de findById pour trouver l'utilisateur par ID

    let usercart = await Cart.findOne({ orderby: auser.id });
    let finalamount = 0;
    if (couponApplied && usercart.totalAfterDiscount) {
      finalamount = usercart.totalAfterDiscount;
    } else {
      finalamount = usercart.cartTotal;
    }
    
    let neworder = await new Order({
      products: usercart.products,
      paimentIntent: { 
        id: uniqid(),
        method: "COD",
        amount: finalamount,
        status: "cash on delevery",
        created: new Date(),
      },
      orderby: auser.id,
      orderStatus: "cash on delevery",
    }).save();

    let update = usercart.products.map((item) => {
      return {
        updateOne: {
          filter: { id: item.product.id },
          update: { $inc: { quantity: -item.count, sold: +item.count } }
        }
      };
    });

    const updated = await Product.bulkWrite(update, {});
    res.json({ message: "success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

const getOrder = asynchandeler(async(req,res)=>{
  const {id} = req.user;
  try{
  const find = await Order.findOne({orderby: id}).populate('products.product').populate("orderby").exec();
  res.json(find)
  }catch(error){
    throw new Error(error)
  }
})

const getallOrder = asynchandeler(async(req,res)=>{
 
  try{
  const find = await Order.find().populate('products.product').populate("orderby").exec();
  res.json(find)
  }catch(error){
    throw new Error(error)
  }
})

const getorderbyuser = async (req, res) => {
  const { id } = req.params;
  validation(id)
  try {
    const orderbyuser = await Order.findOne({ orderby: id })
      .populate('products.product')
      .populate('orderby')
      .exec();
    res.json(orderbyuser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des commandes.' });
  }
};


const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  try {
    validation(id);

    const findOrder = await Order.findByIdAndUpdate(
      id,
      { orderStatus: status,
        paimentIntent:{
          status : status
        } },
      { new: true }
    );

    res.json(findOrder);
  } catch (error) {
    throw new Error(error)
   
  }
};

module.exports = {
  rsetpassword,
  Createuser,
  Getuser,
  Getalluser,
  getauser,
  deleteauser,
  updateauser,
  handlrrefreshtoken,
  logout,
  Updatepassword,
  forgotPassword,
  Getadmin,
  getwishlist,
  creeadres,
  UserCart,
  deletcart,
  getusercart,
  applycoupon,
  createOrder,
  getOrder,
  updateOrderStatus,
  getallOrder,
  getorderbyuser
};
