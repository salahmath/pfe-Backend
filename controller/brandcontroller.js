const Brand = require('../models/brandmodel')

const asynchandeler = require('express-async-handler')

//ajout category
const addbrand = asynchandeler(async(req,res)=>{
    try {
        const id = req.body;
        const adcategory = await Brand.create(id)
        res.json(adcategory)
    }
    catch (error){
        throw new Error(error)
    }
})

const updatebrand = asynchandeler(async(req,res)=>{

    try{
const {id} =req.params;
const update = await Brand.findByIdAndUpdate(id,(req.body),{new:true})
res.json(update)

    }catch (error){
    throw new Error(error)
    }
})
//delete category 
const deletebrand = asynchandeler(async(req,res)=>{

    try{
const {id} =req.params;
const deletee = await Brand.findByIdAndDelete(id)
res.json({
    msg : "user effacer avec succes"
})

    }catch (error){
    throw new Error(error)
    }
})
//get une category
const getbrand = asynchandeler(async(req,res)=>{
    try {
        const {id} = req.params;
        const getcategory = await Brand.findById(id);
        res.json(getcategory);
    }
    catch (error){
        throw new Error(error);
    }
})
//get all caegory 
const getallbrand = asynchandeler(async(req,res)=>{
    try {
        
        const getcategory = await Brand.find();
        res.json(getcategory)
    }
    catch (error){
        throw new Error(error);
    }
})
module.exports = {addbrand , updatebrand,deletebrand ,getbrand,getallbrand}
