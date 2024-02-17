const { get } = require('mongoose');
const Fournisseur = require('../models/fournisseurmodel')
const asynchandeler = require('express-async-handler')




// ajout un fournisseur 
const addfournisseur = asynchandeler(async (req,res)=>{
   try{
     const id = req.body;
     const addfour = await Fournisseur.create(id);
     res.json(addfour)
    }catch (error){
        throw new Error(error)
    }
});
//update a fournisseur
const updatefournisseur =asynchandeler(async (req,res)=>{
    try{
    const {id} =req.params;
    const update = await Fournisseur.findByIdAndUpdate(id,
        req.body,{
        new : true,
    }
    
    )
    res.json(update)
    }catch(error){
        throw new Error(error)

    }
});
//get a fournisseur 

const getfournisseur = asynchandeler(async(req,res)=>{
    try{
    const {id} = req.params;
    const getafour = await Fournisseur.findById(id);
    res.json(getafour)
    }catch(error){
        throw new Error (error)

    }
})

// get all fournisseur 
const getallfournisseur = asynchandeler(async(req,res)=>{
    try{
    const getallf = await Fournisseur.find();
    res.json(getallf)
    }catch(error){
        throw new Error(error)
    }

})
// delete a fournisseur 
const deletefournisseur = asynchandeler(async (req,res)=>{

    try{
    const {id}= req.params;
    const deletef = await Fournisseur.findByIdAndDelete(id);
    res.json({
        msg : "user delete avec success"
    })
    }catch(error){
        throw new Error(error)

    }
})

module.exports = {  addfournisseur , updatefournisseur , getfournisseur , getallfournisseur,deletefournisseur}