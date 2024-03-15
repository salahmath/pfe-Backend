const Coupon =require('../models/couponmodel');
const asynchandeler =require('express-async-handler');



const creecoupon = asynchandeler(async(req,res)=>{
try{
const id = req.body;
const cree = await Coupon.create(id);
res.json(cree)

}catch(error){
throw new Error(error);

}

})
const updatecoupon = asynchandeler(async(req,res)=>{
    try{
    const {id} = req.params;
    const cree = await Coupon.findByIdAndUpdate(id,req.body,{new:true});
    res.json(cree)
    
    }catch(error){
    throw new Error(error);
    
    }
    })
    const getcoupon = asynchandeler(async(req,res)=>{
        try{
        const {id} = req.params;
        const cree = await Coupon.findById(id);
        res.json(cree)
        
        }catch(error){
        throw new Error(error);
        
        }
        })
        const getallcoupon = asynchandeler(async(req,res)=>{
            try{
            
            const cree = await Coupon.find();
            res.json(cree)
            
            }catch(error){
            throw new Error(error);
            
            }
            })
            const deletecoupon = asynchandeler(async(req,res)=>{
                try{
                const {id} = req.params;
                const cree = await Coupon.findByIdAndDelete(id);
                res.json({msg:"deleted avec sucess"})
                
                }catch(error){
                throw new Error(error);
                
                }
                })
module.exports= {creecoupon ,getallcoupon,getcoupon,deletecoupon,updatecoupon }