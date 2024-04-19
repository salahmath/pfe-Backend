const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema({
  
user:{
type:mongoose.Schema.Types.ObjectId,
ref:"User",
required:true
},
Shippinginfo:{
firstName:{
  type:String,
  required:true
},
lastName:{
  type:String,
  required:true
},
Address:{
  type:String,
  required:true
}
,
City:{
  type:String,
  required:true
},
State:{
  type:String,
  required:true
},
Other:{
  type:String,
  required:true
},
CodePin:{
  type:Number,
  required:true
}
},

IdPayment:{
    type:String,
    required:true
  
},
type:{
type:String,
default:"payer à livraison"
},
orderItems:[{
  product:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Product",
    required:true
  },
  color:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Color",
    required:true
  },
  quantity:{
    type:Number,
    required:true
  },
  price:{
    type:Number,
    required:true
  }
}
],
paidAt:{
  type:Date,
  default:Date.now()
},
month:{
  type:Number,
  default: new Date().getMonth()
},
totalPrice:{
  type:Number,
  required:true
},
totalPriceAfterdiscount:{
  type:Number,
  required:true
},


orderStatus:{
type:String,
default:"En attente"
}


  }
  ,{
    timestamps: true
});

//Export the model
module.exports = mongoose.model("Order", orderSchema);
