const { generatetoken } = require("../config/jwtconfig");
const user = require("../models/usermodel");
const Product = require("../models/Productmodel");
const axios = require('axios');

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
  const { id } = req.user;
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
  const { id } = req.user;
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
    const resetUrl = `follow this link <a href="http://localhost:3000/reset-password/${token}">Cliquer ici<a/>`;
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
  const { productId, color, quantite, price } = req.body;
  const { id } = req.user;
  validation(id);
  try {
    // Vérifier si l'article est déjà présent dans le panier de l'utilisateur
    const existingCartItem = await Cart.findOne({ UserId: id, productId: productId });
    if (existingCartItem) {
      return res.status(400).json({ error: "Cet article est déjà présent dans votre panier." });
    }

    // Créer un nouvel article dans le panier
    const newCart = await new Cart({
      UserId: id,
      color,
      quantite,
      price,
      productId
    }).save();
    const carts = await Cart.find({ UserId: id ,_id:newCart._id }).populate("productId").populate("color");
    for (const cart of carts) {
      const oldQuantite = 0;
      const newQuantite = parseInt(newCart.quantite);
      let resultat = oldQuantite;
      if (newQuantite !== oldQuantite) {
        const difference = Math.abs(newQuantite - oldQuantite);
        resultat += newQuantite > oldQuantite ? difference : -difference;
        const product = cart.productId;
        product.quantite -= difference;
        await product.save();
      }
      cart.quantite = resultat;
      await cart.save();
    }

    res.json(carts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// get  cart
const getusercart = asynchandeler(async (req, res) => {
  const { id } = req.user;
  try {
    let carts = await Cart.find({ UserId: id }).populate("color").populate("productId");

    // Filter out carts whose associated products don't exist
    carts = await Promise.all(carts.map(async (cart) => {
      const productExists = await Product.exists({ _id: cart.productId });
      return productExists ? cart : null;
    }));

    // Remove null values from the carts array
    carts = carts.filter(cart => cart !== null);

    // Identify carts with unavailable products
    const cartsWithUnavailableProducts = carts.filter(cart => cart === null);

    // Delete carts with unavailable products
    if (cartsWithUnavailableProducts.length > 0) {
      await Cart.deleteMany({ _id: { $in: cartsWithUnavailableProducts.map(cart => cart._id) } });
    }

    res.json(carts);
  } catch (error) {
    // Handle errors appropriately
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



const deletAcart = asynchandeler(async (req, res) => {
  const { id } = req.user;
  const { Cart_id } = req.params;
  
  try {
    const cart = await Cart.findOne({ UserId: id, _id: Cart_id }).populate("productId");

    const product = await Product.findById(cart.productId);
    const oldQuantite = cart.quantite;
    const newQuantite = parseInt(product.quantite);
    const updatedQuantite = oldQuantite + newQuantite;

    // Update the product's quantity
    const updatedProduct = await Product.findByIdAndUpdate(
      cart.productId,
      { quantite: updatedQuantite },
      { new: true }
    );

    // Delete the cart
    await Cart.deleteOne({ UserId: id, _id: Cart_id });

    res.json({ success: true, message: "Cart deleted successfully", updatedQuantite, updatedProduct });
  } catch (error) {
    // Handle errors appropriately
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




//delete cart
const deleteProductFromPanier = async (req, res) => {
  const {id } = req.user; // Utilisation de destructuring pour extraire _id de req.user

  try {
    const result = await Cart.deleteMany({ UserId: id }); // Assuming userId is the field that represents the user's _id in the Cart model

    res.json(result);
  } catch (error) {
    console.error(error); // Utilisation de console.error pour afficher l'erreur dans la console
    res.status(500).json({ message: "Une erreur s'est produite lors de la suppression du tout produit du panier." });
  }
};
const updateCart = async (req, res) => {
  const { id } = req.user;
  const { Cart_id,newquantite } = req.params;
  try {
    const cart = await Cart.findOne({ UserId: id, _id: Cart_id }).populate("productId");
    if (!cart) {
      return res.status(404).json({ message: "Panier non trouvé" });
    }
    const product = await Product.findById(cart.productId);
    if (!product) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }
    const oldQuantite = cart.quantite;
    const newQuantite = parseInt(newquantite);
    let resultat = oldQuantite;
    if (newQuantite !== oldQuantite) {
      if (newQuantite > oldQuantite) {
        const difference = newQuantite - oldQuantite;
        resultat += difference;
      } else {
        const difference = oldQuantite - newQuantite;
        resultat -= difference;
      }
      product.quantite -= (newQuantite - oldQuantite);
      await product.save();
    }
    cart.quantite = resultat;
    await cart.save();
    res.json({ cart, product });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du panier :", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du panier" });
  }
};
const updatequantite2 = async (req, res) => {
  const { id } = req.params;
  try {
    const rder = await Order.findOne({ _id: id }).populate("user").populate("orderItems.product");
    const orderItems = rder.orderItems;
    await Promise.all(orderItems.map(async (item) => {
      await Product.findOneAndUpdate(
        { _id: item.product._id },
        { $inc: { quantite: item.quantity } },
        { new: true }
      );
      item.quantity = 0;
    }));
    await rder.save();
    res.json(rder);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la quantité de produits :", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de la quantité de produits" });
  }
};




const getorderbyuser = async (req, res) => {
  const { id } = req.params;
  validation(id)
  try {
    const orderbyuser = await Order.find({ _id: id }).populate("user").populate("orderItems.product").populate("orderItems.color");
    res.json(orderbyuser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des commandes.' });
  }
};


const applycoupon = async (req, res) => {
  const { coupon } = req.body;
  const { _id } = req.user;
  try {
    const ecoupon = await Coupon.findOne({ name: coupon });
    if (!ecoupon) {
      throw new Error("This coupon is not valid");
    }
    const auser = await user.findOne({ _id });
    if (!auser) {
      throw new Error("User not found");
    }
    const cart = await Cart.findOne({ UserId: auser._id });
    if (!cart) {
      throw new Error("Cart not found for this user");
    }
    const totalCartPrice = parseFloat(cart.price);
    const discountAmount = (totalCartPrice * ecoupon.discount)/100 ;
    let totalCartPriceAfterDiscount = (totalCartPrice - discountAmount).toFixed(2);
    const updatedCart = await Cart.findOneAndUpdate(
      { UserId: auser._id },
      { totalCartPrice: totalCartPriceAfterDiscount },
      { new: true }
    );

    res.json(totalCartPriceAfterDiscount); // Renvoie le prix total du panier mis à jour
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


const applycouponcart = async (req, res) => {
  const { coupon , solde } = req.body;
  const { _id } = req.user;
  try {
    const ecoupon = await Coupon.findOne({ _id: coupon });
    if (!ecoupon) {
      throw new Error("This coupon is not valid");
    }
    const auser = await user.findOne({ _id });
    if (!auser) {
      throw new Error("User not found");
    }
    const totalCartPrice = solde;
    const discountAmount = (totalCartPrice * ecoupon.discount)/100 ;

    await Coupon.deleteOne({ _id: coupon });

    res.json(discountAmount); // Renvoie le prix total du panier mis à jour
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const createorder= asynchandeler(async(req,res)=>{
  const {Shippinginfo,IdPayment,orderItems,totalPrice,totalPriceAfterdiscount}=req.body;
  const { id } = req.user;
  try{
    const order=await Order.create(
      {
          Shippinginfo,orderItems,totalPrice,totalPriceAfterdiscount,IdPayment,user:id
      })
       res.json({
        order,
        success:true
      })
    
  }catch(error){
    throw new Error(error)
  }
})


const getOrder = asynchandeler(async(req,res)=>{
  const { id } = req.user;
try{
const orders = await Order.find({user:id}).populate("user").populate("orderItems.product").populate("orderItems.color");
res.json(orders)
}catch(erreur){
  throw new Error(erreur)
}
})

const getAllOrder = asynchandeler(async(req,res)=>{
try{
const orders = await Order.find().populate("user").populate("orderItems.product").populate("orderItems.color");
res.json(orders)
}catch(erreur){
  throw new Error(erreur)
}
})
/* const createOrder = async (req, res) => {
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



 */


const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Assuming status is provided in the request body

  try {
    // Update the order status
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: id }, 
      { $set: { orderStatus: req.body.status } }, 
      { new: true } 
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la mise à jour de la commande.' });
  }
};



const chekout = async (req, res) => {
  try {
    const url = "https://developers.flouci.com/api/generate_payment";
    
    const payload = {
      app_token: process.env.key_api,
      app_secret: process.env.secret_api,
      amount: req.body.amount,
      accept_card: true,
      session_timeout_secs: 1200,
      success_link: "http://localhost:3000/chekout",
      fail_link: "http://localhost:3000/erreur",
      developer_tracking_id: "42ecff84-5e68-46f1-9cdb-6c13663af616"
    };

    const response = await axios.post(url, payload);
    res.json({ responseData: response.data, amount: payload.amount });
  } catch (error) {
    console.log(error);
    // Handle the error here
  }
};
const Verifypaiment = async (req, res) => {
  const paymentid = req.params.id;
  const {razorpayorderId ,rezorpayPaymentId}= req.body
  try {
    const response = await axios.get(`https://developers.flouci.com/api/verify_payment/${paymentid}`, {
      headers: {
        'Content-Type': 'application/json',
        'apppublic': process.env.key_api,
        'appsecret': process.env.secret_api
      }
    });
    const data = response.data; 
    
    res.json({data,paymentid});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
const updateOrder2 = async (req, res) => {
  const { type, id } = req.body;
  try {
    const updatedOrder = await Order.findOneAndUpdate(
      { IdPayment: id },
      { $set: { type: type } },
      { new: true }
    );
    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la mise à jour de la commande.' });
  }
};


const getmonth = async (req, res) => {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const d = new Date();
  let endDate=""
  d.setDate(1)

  for (let i = 0; i < 12; i++) {
      
      d.setMonth(d.getMonth() - i);
      endDate=monthNames[d.getMonth()]+""+d.getFullYear()
  }
      const data = await Order.aggregate([
          {
              $match: {
                  createdAt: {
                      $gte: new Date(endDate),
                      $lte: new Date()
                  }
              }
          },
          {
              $group: {
                  _id: { month: "$month" },
                  amount: { $sum: "$totalPriceAfterdiscount" },
                  count: { $sum: 1 }
              }
          }
      ]);

  res.json(data)

};

 
  const getmonthcount = async (req, res) => {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const d = new Date();
    let endDate=""
    d.setDate(1)
  
    for (let i = 0; i < 12; i++) {
        
        d.setMonth(d.getMonth() - i);
        endDate=monthNames[d.getMonth()]+""+d.getFullYear()
    }
        const data = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(endDate),
                        $lte: new Date()
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    amount: { $sum: "$totalPriceAfterdiscount" },
                    count: { $sum: 1 }
                }
            }
        ]);
  
    res.json(data)
  
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
  getusercart,
  applycoupon,
  /* createOrder,
  getOrder,
  getallOrder,
  , */
  createorder,
  deletAcart,
  updateOrderStatus,
  deleteProductFromPanier,
  updateCart,
  chekout,
  updateOrder2,
  Verifypaiment,
  getOrder,
  getmonth,
  getmonthcount,
  getAllOrder,
  getorderbyuser,
  applycouponcart,
  updatequantite2
};
