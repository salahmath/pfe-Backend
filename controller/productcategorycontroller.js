const Category = require('../models/productcategorymodel')

const asynchandeler = require('express-async-handler')

//ajout category
const addcategory = asynchandeler(async(req,res)=>{
    try {
        const id = req.body;
        const adcategory = (await Category.create(id))
        res.json(adcategory)
    }
    catch (error){
        throw new Error(error)
    }
})
//update category 
const updatecaategory = asynchandeler(async(req,res)=>{

    try{
const {id} =req.params;
const update = await Category.findByIdAndUpdate(id,(req.body),{new:true})
res.json(update)

    }catch (error){
    throw new Error(error)
    }
})
//delete category 
const deletecategory = asynchandeler(async(req,res)=>{

    try{
const {id} =req.params;
const deletee = await Category.findByIdAndDelete(id)
res.json({
    msg : "user effacer avec succes"
})

    }catch (error){
    throw new Error(error)
    }
})
//get une category
const getcategory = asynchandeler(async(req,res)=>{
    try {
        const {id} = req.params;
        const getcategory = await Category.findById(id);
        res.json(getcategory);
    }
    catch (error){
        throw new Error(error);
    }
})
//get all caegory 
const getallcategory = asynchandeler(async(req,res)=>{
    try {
        const getcategory = await Category.find();
        res.json(getcategory)
    }
    catch (error){
        throw new Error(error);
    }
})
module.exports = {addcategory , updatecaategory,deletecategory ,getcategory,getallcategory}
