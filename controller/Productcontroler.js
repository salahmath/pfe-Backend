const Product = require("../models/Productmodel");
const asynchandeler = require("express-async-handler");
const slugify = require("slugify");
const User = require("../models/usermodel");
const {cloudinaryUploadImage , cloudinarydeleteImage} = require('../utils/cloudbinary');

const validation = require("../utils/validationMongodb");
//cree un prodact
const creatProduct = asynchandeler(async (req, res) => {
  try {
    if (req.body.title) req.body.slug = slugify(req.body.title);
    if (req.body.quantite < 1) {
      throw new Error("La quantité ne peut pas être inférieure à 0");
    }

    if (req.body.price < 0.1) {
      throw new Error("Le prix ne peut pas être inférieure à 0");
    }
    const CreateProduct = await Product.create(req.body);
    
    res.json(CreateProduct);
  } catch (error) {
    throw new Error("product na pas cree");
  }
});

//get un product
const getAproduct = asynchandeler(async (req, res) => {
  const { id } = req.params;
  validation(id);
  try {
    const getproduct = await Product.findById(id).populate("color");
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
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const productcount = await Product.countDocuments();
      if (skip >= productcount) throw new Error("page ne pas desponible");
    }
    console.log(page, limit, skip);

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
        ...req.body,
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
    const deleteproduct = await Product.findByIdAndDelete(id);
    res.json({ msg: "utilisateur effacer avec success" });
  } catch (error) {
    throw new Error(error);
  }
});

const addtowihlis = asynchandeler(async (req, res) => {
  const { id } = req.user;
  const { prodid } = req.body;
  try {
    const user = await User.findById(id);
    const alreadyadded = await user.wishlist.find(
      (id) => id.toString() === prodid
    );
    if (alreadyadded) {
      let user = await User.findByIdAndUpdate(
        id,
        {
          $pull: { wishlist: prodid },
        },
        {
          new: true,
        }
      );
      res.json(user);
    } else {
      let user = await User.findByIdAndUpdate(
        id,
        {
          $push: { wishlist: prodid },
        },
        {
          new: true,
        }
      );
      res.json(user);
    }
  } catch (error) {
    throw new Error(error);
  }
});


// rating produit
const rating = asynchandeler(async (req, res) => {
  const { id } = req.user;
  const { star, prodid, comment } = req.body;
  try {
    const product = await Product.findById(prodid);
    let alreadyrated = product.rating.find(
      (userid) => userid.UserId.toString() === id.toString()
    );
    if (alreadyrated) { 
      await Product.updateOne(
        {
          rating: { $elemMatch: alreadyrated },
        },
        {
          $set: { "rating.$.star": star, "rating.$.comment": comment },
        }
      );
    } else {
      await Product.findByIdAndUpdate(
        prodid,
        {
          $push: {
            rating: {
              star: star,
              comment: comment,
              UserId: id,
            },
          },
        }
      );
    }
    
    const updatedProduct = await Product.findById(prodid);
    const totalrating = updatedProduct.rating.length;
    const ratingsum = updatedProduct.rating
      .map((item) => item.star)
      .reduce((prev, curr) => prev + curr, 0);
    const actualrating = Math.round(ratingsum / totalrating);

    const finlrate = await Product.findByIdAndUpdate(
      prodid,
      {
        totalrating: actualrating,
      },
      { new: true }
    );
    res.json(finlrate);
  } catch (error) {
    throw new Error(error);
  }
});

const uploadImages = asynchandeler(async (req,res)=>{

  try{
    const uploader = (path) => cloudinaryUploadImage(path, 'images');
    const urls=[];
    const files = req.files;
    for(const file of files){
      const {path}=file;
      const newpath = await uploader(path);
      urls.push(newpath);
    }

    const images =  urls.map((file)=>{
      return file;
    })
    res.json(images);
   
     
  }catch(error){
    throw new Error(error)
  }
});

const deleteImages = asynchandeler(async (req,res)=>{
const {id} = req.params;
  try{
    const result = await cloudinarydeleteImage(id,"images");
    res.json({ message: "deleted" });
   
   
   
     
  }catch(error){
    throw new Error(error)
  }
});
module.exports = {
  creatProduct,
  getAproduct,
  Getallproduct,
  Updateproduct,
  DeleteProduct,
  addtowihlis,
  rating,
  uploadImages,
  deleteImages
};
