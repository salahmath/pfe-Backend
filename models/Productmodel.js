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
    images:[],
    color:[],
    tags:[],
    rating:[{
        star: Number,
        comment: String,
        postedby:{type:mongoose.Schema.Types.ObjectId,
            ref : "User" }
    }],
    totalrating:{
        type:String,
        default : 0,
    }
},
{
    timestamps : true,

});



module.exports = mongoose.model('Product', ProductSchema);