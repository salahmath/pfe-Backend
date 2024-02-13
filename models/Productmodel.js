const mongoose = require('mongoose'); 

var ProductSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim  : true
    },
    slug:{
        type:String,
        required:true,
        unique:true,
        lowercase : true,
    },
    description:{
        type:String,
        required:true,
        
    },
    price:{
        type:Number,
        required:true,
       
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref : "Category"
    },
    brand:{
    type : String,
    required:true
    
    },
    quantite:{ type: Number,
        required:true,
},
    solde:{
        type : Number,
        default:0
    },
    images:{
        type : Array,
        
    },
    color :{
        type : String,
        enum : ["black","yallow","white"]
    },
    rating :[{
        star: Number,
        postedby:{type:mongoose.Schema.Types.ObjectId,
            ref : "User" }
    }]
},
{
    timestamps : true,

});



module.exports = mongoose.model('Product', ProductSchema);