const BlogCategory = require('../models/categoryblog')

const asynchandeler = require('express-async-handler')

//ajout category
const addcategoryblog = asynchandeler(async(req,res)=>{
    try {
        const id = req.body;
        const adcategory = await BlogCategory.create(id)
        res.json(adcategory)
    }
    catch (error){
        throw new Error(error)
    }
})
//update category 
const updatecaategoryblog = asynchandeler(async(req,res)=>{

    try{
const {id} =req.params;
const update = await BlogCategory.findByIdAndUpdate(id,(req.body),{new:true})
res.json(update)

    }catch (error){
    throw new Error(error)
    }
})
//delete category 
const deletecategoryblog = asynchandeler(async(req,res)=>{

    try{
const {id} =req.params;
const deletee = await BlogCategory.findByIdAndDelete(id)
res.json({
    msg : "user effacer avec succes"
})

    }catch (error){
    throw new Error(error)
    }
})
//get une category
const getcategoryblog = asynchandeler(async(req,res)=>{
    try {
        const {id} = req.params;
        const getcategory = await BlogCategory.findById(id);
        res.json(getcategory);
    }
    catch (error){
        throw new Error(error);
    }
})
//get all caegory 
const getallcategoryblog = asynchandeler(async(req,res)=>{
    try {
        
        const getcategory = await BlogCategory.find();
        res.json(getcategory)
    }
    catch (error){
        throw new Error(error);
    }
})
module.exports = {addcategoryblog , updatecaategoryblog,deletecategoryblog ,getcategoryblog,getallcategoryblog}
