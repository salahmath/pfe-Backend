const { query, json } = require("express");
const Product = require("../models/Productmodel");
const asynchandeler = require("express-async-handler");
const slugify = require("slugify");
const Productmodel = require("../models/Productmodel");
//cree un prodact
const creatProduct = asynchandeler(async (req, res) => {
  try {
    if (req.body.title) req.body.slug = slugify(req.body.title);

    const CreateProduct = await Product.create(req.body);
    res.json(CreateProduct);
  } catch (error) {
    throw new Error("product na pas cree");
  }
});

//get un product
const getAproduct = asynchandeler(async (req, res) => {
  const { id } = req.params;
  try {
    const getproduct = await Product.findById(id);
    res.json(getproduct);
  } catch (error) {
    throw new Error(error);
  }
});

//get tout les produits
const Getallproduct = asynchandeler(async (req, res) => {
    try {
      const queryobject = { ...req.query };
      const excludfields = ["page", "sort", "limit", "fields"];
      excludfields.forEach((el) => delete queryobject[el]);
      console.log(queryobject);
      let queryStr = JSON.stringify(queryobject);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
      let query = Product.find(JSON.parse(queryStr)); // Correction de json.parse à JSON.parse
//sort
if (req.query.sort) {
    let sortby = req.query.sort.split(",").join(" ");
    query = query.sort(sortby);
} else {
    query = query.sort("-createdAt"); // Tri par défaut par date de création dans l'ordre décroissant
}

//limite le recherche
if (req.query.fields) {
    let fieldsby = req.query.fields.split(",").join(" ");
    query = query.select(fieldsby);
} else {
    query = query.select("-__v"); // Tri par défaut par date de création dans l'ordre décroissant
}
//limite page
const page = req.query.page;
const limit = req.query.limit;
const skip = (page-1)*limit;
query =query.skip(skip).limit(limit);
if(req.query.page){
    const productcount = await Product.countDocuments();
    if(skip>= productcount)throw new Error ('page ne pas desponible')
}
console.log(page,limit,skip)

      const products = await query; // Utilisation correcte de await
      res.json(products);
    } catch (error) {
      throw new Error(error);
    }
  });
  
//update un utilisateur
const Updateproduct = asynchandeler(async (req, res) => {
  const { id } = req.params;
  try {
    const update = await Product.findByIdAndUpdate(
      id,

      {
        title: req?.body?.title,
        description: req?.body?.description,
        price: req?.body?.price,
        quantite: req?.body?.quantite,
        slug: slugify(req.body.title),
      },
      {
        new: true,
      }
    );
    res.json(update);
  } catch (error) {
    throw new Error(error);
  }
});
//effacer un produit
const DeleteProduct = asynchandeler(async (req, res) => {
  const { id } = req.params;

  try {
    const deleteproduct = await Product.findOneAndDelete(id);
    res.json({ msg: "utilisateur effacer avec success" });
  } catch (error) {
    throw new Error(error);
  }
});


module.exports = {
  creatProduct,
  getAproduct,
  Getallproduct,
  Updateproduct,
  DeleteProduct,
};
