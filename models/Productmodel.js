const mongoose = require('mongoose'); 

var ProductSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim  : true
    },
    slug:{
        type:String,
        
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
        type:String
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
    images:[{
        public_id:String,
        url:String

    }],
    color:[],
    tags:{type : String},
    rating:[{
        star: Number,
        comment: String,
        postedby:{type:mongoose.Schema.Types.ObjectId,
            ref : "User" }
    }],
    totalrating:{
        type:String,
        default : 0,
    },
    fournisseur:
        {type:mongoose.Schema.Types.ObjectId,
            ref : "Fournisseur" 
    },
},
{
    timestamps : true,

});



module.exports = mongoose.model('Product', ProductSchema);