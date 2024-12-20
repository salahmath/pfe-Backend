const { generatetoken } = require("../config/jwtconfig");
const user = require("../models/usermodel");
const Product = require("../models/Productmodel");
const axios = require("axios");
const fetch = require("node-fetch"); // Assurez-vous d'avoir installé le module node-fetch

const Cart = require("../models/cart");
const asynchandeler = require("express-async-handler");
const validation = require("../utils/validationMongodb");
const { Refreshtoken } = require("../config/tokenrefresh");
const jwt = require("jsonwebtoken");
const sendEmail = require("../controller/emailcontrol");
const crypto = require("crypto");
const Coupon = require("../models/couponmodel");
const { trusted } = require("mongoose");
const uniqid = require("uniqid");
const Order = require("../models/ordermodel");
const Twilio = require("../models/verifier");
//cree un utilisateur
const textflow = require("textflow.js");
const accountSid = 'ACaef3bdd5f04b5bb76e8730942abeff5a';
const authToken = '5e4618669e8ff70d093bfab62e35bc3a';
const client = require('twilio')(accountSid, authToken);

const Createuser = asynchandeler(async (req, res) => {
  try {
    const { email, mobile,body } = req.body;
    // Vérifie si l'utilisateur existe déjà avec cet e-mail
    const findUser = await user.findOne({ email: email });
    if (findUser) {
      throw new Error("Utilisateur déjà ajouté.");
    }

    // Vérifie si le numéro de téléphone est disponible dans le tableau Twilio
    const twilioEntry = await Twilio.findOne({ number: mobile , body:body }).exec();
    if (!twilioEntry) {
      throw new Error("Numéro de téléphone non disponible dans Twilio.");
    }

    // Si l'utilisateur n'existe pas et que le numéro de téléphone est disponible, créez l'utilisateur
    const createdUser = await user.create(req.body);
    res.json(createdUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//verifier l'existant d'un utilisateur:login
const Getuser = asynchandeler(async (req, res) => {
  const { email, password } = req.body;
  const finduser = await user.findOne({ email });
  if (finduser && (await finduser.isPasswordMatched(password))) {  // Actions à effectuer si l'utilisateur est trouvé et le mot de passe(crypter) est correct
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
      //Cette option empêche le cookie d'être accessible via JavaScript côté client (document.cookie). Cela aide à protéger le cookie contre les attaques XSS (cross-site scripting).
      maxAge: 72 * 60 * 60 * 1000,
      //Cette option définit la durée de vie du cookie en millisecondes. Ici, 72 * 60 * 60 * 1000 équivaut à 72 heures (3 jours).
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
    throw new Error("Aucun utilisateur trouvé");
  }
});
//effacer un utilisateur
const deleteauser = asynchandeler(async (req, res) => {
  const { id } = req.params;
  const User = await user.findById(id);
  const delUser = await user.findByIdAndDelete(id);
  const deleteorder = await Order.findOneAndDelete({user : id})
  const deletTwilio = await Twilio.findOneAndDelete({number : User.mobile})
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
    const resetUrl = `follow this link <a href="http://localhost:3001/reset-password/${token}">Cliquer ici<a/>`;
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
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");//token hethi li 5dhinaha l lien 
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

const UserCart = asynchandeler(async (req, res) => {//panierrrrrrrrr
  const { productId, color, quantite, price } = req.body;
  const { id } = req.user;
  validation(id);
  try {
    // Vérifier si l'article est déjà présent dans le panier de l'utilisateur
    const existingCartItem = await Cart.findOne({
      UserId: id,
      productId: productId,
    });
    if (existingCartItem) {
      return res
        .status(400)
        .json({ error: "Cet article est déjà présent dans votre panier." });
    }

    // Créer un nouvel article dans le panier
    const newCart = await new Cart({
      UserId: id,
      color,
      quantite,
      price,
      productId,
    }).save();
    const carts = await Cart.find({ UserId: id, _id: newCart._id })
      .populate("productId")
      .populate("color");
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
    let carts = await Cart.find({ UserId: id })
      .populate("color")
      .populate("productId");

    // Filter out carts whose associated products don't exist
    carts = await Promise.all(
      carts.map(async (cart) => {
        const productExists = await Product.exists({ _id: cart.productId });
        return productExists ? cart : null;
      })
    );

    // Remove null values from the carts array
    carts = carts.filter((cart) => cart !== null);

    // Identify carts with unavailable products
    const cartsWithUnavailableProducts = carts.filter((cart) => cart === null);

    // Delete carts with unavailable products
    if (cartsWithUnavailableProducts.length > 0) {
      await Cart.deleteMany({
        _id: { $in: cartsWithUnavailableProducts.map((cart) => cart._id) },
      });
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
    const cart = await Cart.findOne({ UserId: id, _id: Cart_id }).populate(
      "productId"
    );

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

    res.json({
      success: true,
      message: "Cart deleted successfully",
      updatedQuantite,
      updatedProduct,
    });
  } catch (error) {
    // Handle errors appropriately
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//delete cart
const deleteProductFromPanier = async (req, res) => {
  const { id } = req.user; 
  try {
    const result = await Cart.deleteMany({ UserId: id }); // Assuming userId is the field that represents the user's _id in the Cart model

    res.json(result);
  } catch (error) {
    console.error(error); // Utilisation de console.error pour afficher l'erreur dans la console
    res
      .status(500)
      .json({
        message:
          "Une erreur s'est produite lors de la suppression du tout produit du panier.",
      });
  }
};
//fl assel kol roduit chy5ou cart w7dou
const updateCart = async (req, res) => {
  const { id } = req.user;
  const { Cart_id, newquantite } = req.params;
  try {
    const cart = await Cart.findOne({ UserId: id, _id: Cart_id }).populate(
      "productId"
    );
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
      product.quantite -= newQuantite - oldQuantite;
      await product.save();
    }
    cart.quantite = resultat;
    await cart.save();
    res.json({ cart, product });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du panier :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du panier" });
  }
};
//annuler coandee bl useeffect "controle"
const updatequantite2 = async (req, res) => {
  const { id } = req.params;
  try {
    const rder = await Order.findOne({ _id: id })
      .populate("user")
      .populate("orderItems.product");
    const orderItems = rder.orderItems;
    await Promise.all(
      orderItems.map(async (item) => {
        await Product.findOneAndUpdate(
          { _id: item.product._id },
          { $inc: { quantite: item.quantity } },
          { new: true }
        );
        item.quantity = 0;
      })
    );
    await rder.save();
    res.json(rder);
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour de la quantité de produits :",
      error
    );
  }
};

const getorderbyuser = async (req, res) => {
  const { id } = req.params;
  validation(id);
  try {
    const orderbyuser = await Order.find({ _id: id })
      .populate("user")
      .populate("orderItems.product")
      .populate("orderItems.color");
    res.json(orderbyuser);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message:
          "Une erreur est survenue lors de la récupération des commandes.",
      });
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
    const discountAmount = (totalCartPrice * ecoupon.discount);
    let totalCartPriceAfterDiscount = (totalCartPrice - discountAmount).toFixed(
      2
    );
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
  const { coupon, solde } = req.body;
  const { _id } = req.user;
  try {
    // Recherche du coupon dans la base de données
    const ecoupon = await Coupon.findOne({ _id: coupon });
    if (!ecoupon) {
      throw new Error("This coupon is not valid");
    }
    // Recherche de l'utilisateur dans la base de données
    const auser = await user.findOne({ _id });
    if (!auser) {
      throw new Error("User not found");
    }
    // Calcul du montant de la réduction
    const totalCartPrice = parseFloat(solde);
    const discountAmount = totalCartPrice * (ecoupon.discount / 100);
    // Calcul du prix total du panier après application de la réduction
    const updatedTotalCartPrice = totalCartPrice - discountAmount;
    // Suppression du coupon de la base de données
    await Coupon.deleteOne({ _id: coupon });

    // Renvoi du prix total du panier mis à jour
    res.json({ updatedTotalCartPrice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const createorder = asynchandeler(async (req, res) => {
  const {
    Shippinginfo,
    IdPayment,
    orderItems,
    totalPrice,
    totalPriceAfterdiscount,
  } = req.body;
  const { id } = req.user;
  try {
    const order = await Order.create({
      Shippinginfo,
      orderItems,
      totalPrice,
      totalPriceAfterdiscount,
      IdPayment,
      user: id,
    });
    res.json({
      order,
      success: true,
    });
  } catch (error) {
    throw new Error(error);
  }
});
//lel user
const getOrder = asynchandeler(async (req, res) => {
  const { id } = req.user;
  try {
    const orders = await Order.find({ user: id })
      .populate("user")
      .populate("orderItems.product")
      .populate("orderItems.color");
    res.json(orders);
  } catch (erreur) {
    throw new Error(erreur);
  }
});

const getAllOrder = asynchandeler(async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user")
      .populate("orderItems.product")
      .populate("orderItems.color");

    res.json(orders);
  } catch (erreur) {
    throw new Error(erreur);
  }
});

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
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message:
          "Une erreur est survenue lors de la mise à jour de la commande.",
      });
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
      fail_link: "http://localhost:3000/chekout",
      developer_tracking_id: "42ecff84-5e68-46f1-9cdb-6c13663af616",
    };

    const response = await axios.post(url, payload);
    res.json({ responseData: response.data, amount: payload.amount });
  } catch (error) {
    console.log(error);
  }
};
const Verifypaiment = async (req, res) => {
  const paymentid = req.params.id;
  try {
    const response = await axios.get(
      `https://developers.flouci.com/api/verify_payment/${paymentid}`,
      {
        headers: {
          "Content-Type": "application/json",
          apppublic: process.env.key_api,
          appsecret: process.env.secret_api,
        },
      }
    );
    const data = response.data;
    res.json({ data, paymentid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
//hethi bch nbdlha ya cart ya konnect bl tye
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
    res
      .status(500)
      .json({
        message:
          "Une erreur est survenue lors de la mise à jour de la commande.",
      });
  }
};

const getmonth = async (req, res) => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const d = new Date();
  let endDate = "";
  d.setDate(1);
  for (let i = 0; i < 12; i++) {
    d.setMonth(d.getMonth() - i);
    endDate = monthNames[d.getMonth()] + "" + d.getFullYear();
  }
  const data = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(endDate),
          $lte: new Date(),
        },
      },
    },
    {
      $group: {
        _id: { month: "$month" },
        amount: { $sum: "$totalPriceAfterdiscount" },
        count: { $sum: 1 },
      },
    },
  ]);

  res.json(data);
};

const getmonthcount = async (req, res) => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const d = new Date();
  let endDate = "";
  d.setDate(1);

  for (let i = 0; i < 12; i++) {
    d.setMonth(d.getMonth() - i);
    endDate = monthNames[d.getMonth()] + "" + d.getFullYear();
  }
  const data = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(endDate),
          $lte: new Date(),
        },
      },
    },
    {
      $group: {
        _id: null,
        amount: { $sum: "$totalPriceAfterdiscount" },
        count: { $sum: 1 },
      },
    },
  ]);

  res.json(data);
};

const getordersnum = async (req, res) => {
  try {
    const data = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
    ]);
    res.json(data);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message:
          "Une erreur s'est produite lors de la récupération des données.",
      });
  }
};

const getTotalClientsAndOrders = async (req, res) => {
  try {
  } catch (error) {
    console.error(error);
  }
};

/*   const ckonnert = async (req, res) => {
  
    const { amount } = req.body;
    try {
        // Effectuer une requête HTTP vers l'API de Konnect pour initier le paiement
        const response = await axios.post('https://api.konnect.network/api/v2/payments/init-payment', { amount });
        
        // Extraire l'URL de paiement de la réponse de Konnect
        const payUrl = response.data.payUrl;

        // Renvoyer l'URL de paiement en réponse
        res.json({ payUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de l\'initialisation du paiement' });
    }
}; */
const URLS = "http://localhost:3000/Success";
const URLS1 = "http://localhost:3000/failed";
const ckonnert = async (req, res) => {
  const { nom, prenom, mobile, email, oredrid, amount } = req.body;
  try {
    const configData = {
      receiverWalletId: "663108d2d65ce91d9ece8c6d",
      token: "TND",
      amount: amount,
      type: "immediate",
      description: "payment success",
      acceptedPaymentMethods: ["wallet", "bank_card", "e-DINAR"],
      lifespan: 10,
      checkoutForm: false,
      addPaymentFeesToAmount: false,
      firstName: nom,
      lastName: prenom,
      phoneNumber: mobile,
      email: email,
      orderId: oredrid,
      webhook: "https://merchant.tech/api/notification_payment",
      silentWebhook: true,
      successUrl:"http://localhost:3001/Success",
      failUrl: "http://localhost:3001/failed",
      theme: "dark",
    };

    const response = await fetch(
      "https://api.preprod.konnect.network/api/v2/payments/init-payment",
      {
        method: "POST",
        headers: {
          "x-api-key": "663108d2d65ce91d9ece8c69:R389J5xwFVuSqwnhSpsXpgH",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(configData),
      }
    );

    const responseData = await response.json();
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: oredrid },
      { $set: { payment_ref: responseData.paymentRef } },
      { new: true }
    );
    res.json(responseData);
  } catch (error) {
    res.json(error);
  }
};

const check = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await fetch(
      `https://api.preprod.konnect.network/api/v2/payments/${id}`
    );
    const responseData = await response.json();
    const updatedOrder = await Order.findOneAndUpdate(
      { payment_ref: responseData.payment.id },
      { $set: { type: responseData.payment.successfulTransactions,method:responseData.payment.transactions[0].method} },
      { new: true }
    );
    res.json({ updatedOrder, responseData });

    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Une erreur s'est produite" });
  }
};
//controle  ll h 
const getAllOrdersanspay = async (req, res) => {
  try {
    const currentDate = new Date();
    const fortyEightHoursAgo = new Date(currentDate);
    fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 24);
    const updatedOrders = await Order.updateMany(
      { type: { $ne: "1" }, createdAt: { $lt: fortyEightHoursAgo } },
      { $set: { orderStatus: "Annulé" } }
    );

    // Récupérer toutes les commandes
    const orders = await Order.find();

    res.json({ fortyEightHoursAgo, updatedOrders, orders });
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour du statut de la commande :",
      error
    );
    res
      .status(500)
      .json({
        success: false,
        message: "Erreur lors de la mise à jour du statut de commande",
        error: error.message,
      });
  }
};

const getordersnum1 = async (req, res) => {
  try {
    const data = await Order.aggregate([
      {
        $match: { orderStatus: "Annulé" }, // Filtrer les commandes annulées
      },
      {
        $unwind: "$orderItems",
      },
      {
        $group: {
          _id: "$orderItems.product",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "products", // Supposons que la collection des produits s'appelle "products"
          localField: "_id",
          foreignField: "_id",
          as: "productData",
        },
      },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          count: 1,
          productName: { $arrayElemAt: ["$productData.title", 0] },
        },
      },
    ]);
    res.json(data);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message:
          "Une erreur s'est produite lors de la récupération des données.",
      });
  }
};

//

const send1 = async (req, res) => {
  const { number, body } = req.body; // Utilisation de la déstructuration pour extraire les valeurs de req.body

  try {
    // Envoyer le message avec Twilio
    const message = await client.messages.create({
      body: body,
      from: '+14174792021',
      to: `+216${number}`,
    });

    console.log('SMS sent successfully. SID:', message.sid);

    // Enregistrer le message dans la base de données
    const twilioMessage = new Twilio({ number, body });
    await twilioMessage.save();

    res.status(200).json({ status: 'success', message: 'Message sent and saved successfully' });
  } catch (error) {
    console.error('Error sending message or saving to database:', error);
    res.status(500).json({ status: 'error', message: 'Failed to send message or save to database', error: error.message });
  }
};

// Define the verification function
const verify1 = async () => {
  // Send verification SMS
  textflow.sendVerificationSMS("+21628896143", verificationOptions);

  // Simulating user submitting the code
  let result = await textflow.verifyCode("+11234567890", "USER_ENTERED_CODE");

  if (result.valid) {
    console.log("Verified!");
  } else {
    console.log("Verification failed.");
  }
}
module.exports = {
  rsetpassword,
  getAllOrdersanspay,
  check,
  Createuser,
  Getuser,
  Getalluser,
  getauser,
  getordersnum1,
  ckonnert,
  deleteauser,
  updateauser,
  getTotalClientsAndOrders,
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
  getordersnum,
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
  updatequantite2,
  send1,verify1
};
