const Coupon =require('../models/couponmodel');
const asynchandeler =require('express-async-handler');



const creecoupon = async (req, res) => {
    try {
        const { name, discount, expiry } = req.body;
        
        // Check if expiry date is earlier than the current date
        if (new Date(expiry) < Date.now()) {
            return res.status(400).json({ error: "Expiry date cannot be in the past." });
        }
        
        const cree = await Coupon.create({ name, discount, expiry });
        res.json(cree);
    } catch (error) {
        throw new Error(error);
    }
};

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

        const getallcoupon = async (req, res) => {
            try {
                const coupons = await Coupon.find();
        
                for (const coupon of coupons) {
                    if (coupon.expiry < Date.now()) {
                        const deletedCoupon = await Coupon.findByIdAndDelete(coupon._id);
                    }
                }
                
                res.json(coupons);
            } catch (error) {
                throw new Error(error);
            }
        };
        
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